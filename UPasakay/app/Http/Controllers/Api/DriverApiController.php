<?php

namespace App\Http\Controllers\Api;

use App\Events\PassengerBoarded;
use App\Events\RideCompleted;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Notification;
use App\Models\PickupRequest;
use App\Services\DriverAssignmentService;
use App\Services\PickupRequestService;
use Illuminate\Http\Request;

class DriverApiController extends Controller
{
    public function __construct(
        private PickupRequestService $pickupRequests,
        private DriverAssignmentService $driverAssignments,
    ) {}

    /**
     * Resolve the authenticated user's driver row, or null.
     */
    private function driverFor(Request $request): ?Driver
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        return Driver::with('shuttle.route')
            ->where('user_id', $user->id)
            ->first();
    }

    /**
     * Single feed powering the mobile "Up Next" view + Home counters:
     * shuttle, route, ordered stops with waiting counts, and the
     * hybrid-ordered queue with per-passenger status.
     */
    /**
     * Driver flips on/off duty from the mobile app. Mirrors the value the
     * web admin dashboard reads (is_available + driver_status), so going
     * offline immediately shows as "offline" there too.
     */
    public function setStatus(Request $request)
    {
        $driver = $this->driverFor($request);
        if (! $driver) {
            return response()->json(['message' => 'No driver profile found.'], 404);
        }

        $validated = $request->validate([
            'on_duty' => 'required|boolean',
        ]);

        $onDuty = $validated['on_duty'];

        $driver->update([
            'is_available' => $onDuty,
            'driver_status' => $onDuty ? 'active' : 'offline',
        ]);

        // Mirror onto the assigned shuttle so the web Live Map adds the
        // marker when on duty and drops it the moment the driver toggles off.
        $shuttle = $driver->shuttle;
        if ($shuttle) {
            $shuttle->update([
                'status' => $onDuty ? 'active' : 'offline',
                'last_seen_at' => now(),
            ]);
            broadcast(new \App\Events\ShuttleStatusChanged(
                $shuttle->id,
                $onDuty ? 'active' : 'offline',
            ));
        }

        return response()->json([
            'on_duty' => (bool) $onDuty,
            'driver_status' => $driver->driver_status,
        ]);
    }

    public function queue(Request $request)
    {
        $driver = $this->driverFor($request);
        if (! $driver) {
            return response()->json(['message' => 'No driver profile found.'], 404);
        }

        $shuttle = $driver->shuttle;
        $route = $shuttle?->route;

        if (! $route) {
            return response()->json([
                'driver' => ['id' => $driver->id, 'name' => $driver->full_name, 'on_duty' => (bool) $driver->is_available],
                'shuttle' => $shuttle ? $this->shuttlePayload($shuttle) : null,
                'route' => null,
                'stops' => [],
                'queue' => [],
                'counts' => ['pending' => 0, 'boarded' => 0, 'capacity' => (int) ($shuttle->capacity ?? 0)],
            ]);
        }

        $queue = $this->pickupRequests->queueForRoute($route->id);

        $waitingByStop = $queue
            ->where('status', 'pending')
            ->groupBy('pickup_stop_id')
            ->map->count();

        $stops = $route->stops()->get()->map(fn ($stop) => [
            'id' => $stop->id,
            'name' => $stop->name,
            'sequence' => (int) $stop->sequence,
            'latitude' => $stop->latitude,
            'longitude' => $stop->longitude,
            'waiting' => (int) ($waitingByStop[$stop->id] ?? 0),
        ])->values();

        return response()->json([
            'driver' => ['id' => $driver->id, 'name' => $driver->full_name],
            'shuttle' => $this->shuttlePayload($shuttle),
            'route' => [
                'id' => $route->id,
                'name' => $route->name,
                'start_location' => $route->start_location,
                'end_location' => $route->end_location,
            ],
            'stops' => $stops,
            'queue' => $queue->map(fn ($r) => [
                'id' => $r->id,
                'passenger' => $r->user?->full_name ?? $r->user?->name ?? 'Passenger',
                'pickup_stop_id' => $r->pickup_stop_id,
                'pickup_stop' => $r->pickupStop?->name,
                'dropoff_stop' => $r->dropoffStop?->name,
                'status' => $r->status,
                'eta_minutes' => $r->eta_minutes,
                'queue_position' => $r->queue_position,
            ])->values(),
            'counts' => [
                'pending' => $queue->where('status', 'pending')->count(),
                'boarded' => $queue->where('status', 'in_progress')->count(),
                'accepted' => $queue->where('status', 'accepted')->count(),
                'capacity' => (int) ($shuttle->capacity ?? 0),
            ],
        ]);
    }

    private function shuttlePayload($shuttle): array
    {
        return [
            'id' => $shuttle->id,
            'shuttle_code' => $shuttle->shuttle_code,
            'shuttle_type' => $shuttle->shuttle_type,
            'plate_number' => $shuttle->plate_number,
            'capacity' => (int) ($shuttle->capacity ?? 0),
            'status' => $shuttle->status,
        ];
    }

    /**
     * Driver-facing notifications log (newest first).
     */
    public function notifications(Request $request)
    {
        $driver = $this->driverFor($request);
        if (! $driver) {
            return response()->json(['message' => 'No driver profile found.'], 404);
        }

        $routeId = $driver->shuttle?->route_id;

        $notifications = Notification::where('audience', 'drivers')
            ->when($routeId, fn ($q) => $q->where(function ($q) use ($routeId) {
                $q->where('route_id', $routeId)->orWhereNull('route_id');
            }))
            ->latest('created_at')
            ->limit(100)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'time' => $n->getFormattedTime(),
                'date' => $n->getFormattedDate(),
                'created_at' => $n->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $notifications]);
    }

    /**
     * Mark a passenger boarded — the only mutating action allowed on the
     * driver app, and only at the point of boarding at a stop.
     */
    public function board(Request $request, PickupRequest $pickupRequest)
    {
        if ($error = $this->authorizeDriverOwnsRequest($request, $pickupRequest)) {
            return $error;
        }

        // Set the pickup directly: DriverAssignmentService::updateStatus only
        // maps completed/cancelled (default → 'accepted'), so routing
        // 'in_progress' through it would wrongly reset the pickup to accepted.
        $pickupRequest->update(['status' => 'in_progress', 'boarded_at' => now()]);
        if ($pickupRequest->assignment) {
            $pickupRequest->assignment->update(['status' => 'in_progress']);
        }

        broadcast(new PassengerBoarded($pickupRequest->fresh(['user.passenger'])));

        $this->pickupRequests->logDriverNotification(
            $pickupRequest->fresh(['user', 'pickupStop']),
            ($pickupRequest->user?->full_name ?? 'Passenger').' boarded.'
        );

        return response()->json($pickupRequest->fresh());
    }

    /**
     * Driver marks a boarded passenger as dropped off — completes the ride.
     */
    public function complete(Request $request, PickupRequest $pickupRequest)
    {
        if ($error = $this->authorizeDriverOwnsRequest($request, $pickupRequest)) {
            return $error;
        }

        if ($pickupRequest->status !== 'in_progress') {
            return response()->json(['message' => 'This passenger has not boarded yet.'], 409);
        }

        $routeId = $pickupRequest->route_id;
        $passengerName = $pickupRequest->user?->full_name ?? 'Passenger';

        if ($pickupRequest->assignment) {
            $this->driverAssignments->updateStatus($pickupRequest->assignment, 'completed');
        } else {
            $pickupRequest->update(['status' => 'completed', 'completed_at' => now()]);
        }

        try {
            broadcast(new RideCompleted(
                $pickupRequest->fresh(['user.passenger', 'assignment.driver.user'])
            ));
        } catch (\Throwable $e) {
            \Log::error('RideCompleted broadcast failed: '.$e->getMessage());
        }

        $this->pickupRequests->logDriverNotification(
            $pickupRequest->fresh(['user', 'pickupStop']),
            $passengerName.' dropped off.'
        );

        $promoted = $this->pickupRequests->promoteNextInQueue($routeId);

        return response()->json([
            'pickup_request' => $pickupRequest->fresh(),
            'promoted' => $promoted,
        ]);
    }

    /**
     * No-show at the stop — frees a seat and promotes the next waiter.
     */
    public function noShow(Request $request, PickupRequest $pickupRequest)
    {
        return $this->cancelAndPromote($request, $pickupRequest, 'no_show', 'did not show up');
    }

    /**
     * Driver declines a passenger at boarding — also frees a seat.
     */
    public function decline(Request $request, PickupRequest $pickupRequest)
    {
        return $this->cancelAndPromote($request, $pickupRequest, 'declined', 'was declined at boarding');
    }

    private function cancelAndPromote(Request $request, PickupRequest $pickupRequest, string $reason, string $phrase)
    {
        if ($error = $this->authorizeDriverOwnsRequest($request, $pickupRequest)) {
            return $error;
        }

        $routeId = $pickupRequest->route_id;
        $passengerName = $pickupRequest->user?->full_name ?? 'Passenger';

        if ($pickupRequest->assignment) {
            $this->driverAssignments->updateStatus($pickupRequest->assignment, 'cancelled');
        } else {
            $pickupRequest->update(['status' => 'cancelled']);
        }

        $this->pickupRequests->logDriverNotification(
            $pickupRequest->fresh(['user', 'pickupStop']),
            $passengerName.' '.$phrase.'.'
        );

        $promoted = $this->pickupRequests->promoteNextInQueue($routeId);

        return response()->json([
            'pickup_request' => $pickupRequest->fresh(),
            'reason' => $reason,
            'promoted' => $promoted,
        ]);
    }

    /**
     * Ensure the request belongs to the authenticated driver's assignment.
     */
    private function authorizeDriverOwnsRequest(Request $request, PickupRequest $pickupRequest)
    {
        $driver = $this->driverFor($request);
        if (! $driver) {
            return response()->json(['message' => 'No driver profile found.'], 404);
        }

        $assignment = $pickupRequest->assignment;

        // Allow if assigned to this driver, OR (no assignment yet but the
        // request is on this driver's active route — covers queued pickups).
        $ownsViaAssignment = $assignment && (int) $assignment->driver_id === (int) $driver->id;
        $onDriverRoute = $driver->shuttle?->route_id
            && (int) $pickupRequest->route_id === (int) $driver->shuttle->route_id;

        if (! $ownsViaAssignment && ! $onDriverRoute) {
            return response()->json(['message' => 'This request is not assigned to you.'], 403);
        }

        if (in_array($pickupRequest->status, ['completed', 'cancelled'], true)) {
            return response()->json(['message' => 'This request is already closed.'], 409);
        }

        return null;
    }
}
