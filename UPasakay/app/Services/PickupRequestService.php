<?php

namespace App\Services;

use App\Events\RideCompleted;
use App\Models\DeviceToken;
use App\Models\Driver;
use App\Models\Notification;
use App\Models\PickupRequest;
use App\Models\Shuttle;
use App\Models\ShuttleLocation;
use App\Models\Stop;
use App\Models\User;
use App\Support\Geo;
use Illuminate\Validation\ValidationException;

class PickupRequestService
{
    public function __construct(
        private ExpoPushService $expoPush,
        private DriverAssignmentService $driverAssignments,
    ) {}

    /**
     * Create a new pickup request for an authenticated user.
     * Prevents duplicate submissions for active bookings.
     * Calculates ETA from driver's latest location to pickup stop
     * using the Haversine formula assuming 30 km/h shuttle speed.
     *
     * @param  User  $user  The authenticated user
     * @param  array  $data  Validated request data containing route_id, pickup_stop_id, dropoff_stop_id
     * @return PickupRequest with eta_minutes if driver location is available
     *
     * @throws ValidationException if passenger is invalid or duplicate booking exists
     */
    public function createPickupRequest(User $user, array $data): PickupRequest
    {
        // Check if user has a valid passenger profile
        if (! $user->passenger) {
            throw ValidationException::withMessages([
                'passenger' => 'User does not have a valid passenger profile.',
            ]);
        }

        $passenger = $user->passenger;

        // Check if passenger is active
        if ($passenger->passenger_status !== 'active') {
            throw ValidationException::withMessages([
                'passenger_status' => 'Passenger account is not active.',
            ]);
        }

        if ($passenger->verification_status !== 'approved') {
            throw ValidationException::withMessages([
                'verification_status' => 'Passenger account is not verified yet.',
            ]);
        }

        // Both stops must belong to the chosen route. The request validation
        // only checks the stop ids exist in `stops` — without this guard a
        // passenger could mix a pick-up/drop-off from a different route into
        // one request (it would then show up wrongly in the Requests tab).
        $pickupOnRoute = Stop::where('id', $data['pickup_stop_id'])
            ->where('route_id', $data['route_id'])
            ->exists();

        if (! $pickupOnRoute) {
            throw ValidationException::withMessages([
                'pickup_stop_id' => 'The selected pick-up stop is not on this route.',
            ]);
        }

        $dropoffOnRoute = Stop::where('id', $data['dropoff_stop_id'])
            ->where('route_id', $data['route_id'])
            ->exists();

        if (! $dropoffOnRoute) {
            throw ValidationException::withMessages([
                'dropoff_stop_id' => 'The selected drop-off stop is not on this route.',
            ]);
        }

        // Reject the request if no driver is currently on duty for the chosen route
        $shuttle = $this->activeShuttleForRoute($data['route_id']);
        if (! $shuttle || ! $shuttle->driver_id) {
            throw ValidationException::withMessages([
                'route_id' => 'No driver is currently on duty for this route. Please try again later.',
            ]);
        }

        // Check for duplicate active booking
        $existingActiveBooking = PickupRequest::where('user_id', $user->id)
            ->where('route_id', $data['route_id'])
            ->where('pickup_stop_id', $data['pickup_stop_id'])
            ->where('dropoff_stop_id', $data['dropoff_stop_id'])
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->first();

        if ($existingActiveBooking) {
            throw ValidationException::withMessages([
                'booking' => 'You already have an active booking for this route and stops. Please complete or cancel your existing booking first.',
            ]);
        }

        // Create the new pickup request
        $pickupRequest = PickupRequest::create([
            'user_id' => $user->id,
            'route_id' => $data['route_id'],
            'pickup_stop_id' => $data['pickup_stop_id'],
            'dropoff_stop_id' => $data['dropoff_stop_id'],
            'status' => 'pending',
        ]);
        $latestLocation = ShuttleLocation::latest('recorded_at')->first();

        if ($latestLocation) {
            $pickupStop = Stop::find($data['pickup_stop_id']);
            if ($pickupStop) {
                $pickupRequest->eta_minutes = $this->calculateETA(
                    $latestLocation->latitude,
                    $latestLocation->longitude,
                    $pickupStop->latitude,
                    $pickupStop->longitude
                );
                $pickupRequest->save();
            }
        }

        $pickupRequest->load('pickupStop');

        // Capacity-gated auto-accept: if the route's active shuttle still has
        // free seats, accept immediately and assign its driver. Otherwise the
        // request waits in the route queue (status stays 'pending').
        try {
            $this->placeInQueue($pickupRequest);
        } catch (\Throwable $e) {
            \Log::error('placeInQueue failed: ' . $e->getMessage());
        }

        // Push notifications are deferred to run after the HTTP response is
        // sent so their network latency (Expo HTTP call) never blocks the
        // passenger's booking confirmation. defer() is a Laravel 11+ helper
        // that runs the closure in the request terminate phase.
        $notificationMessage = ($passenger->full_name ?? 'A passenger').' is waiting at '
            .($pickupRequest->pickupStop?->name ?? 'a stop')
            .($pickupRequest->pickupStop?->sequence !== null
                ? ' (Stop '.((int) $pickupRequest->pickupStop->sequence + 1).')'
                : '')
            .'.';

        defer(function () use ($pickupRequest, $passenger, $notificationMessage) {
            try {
                $this->notifyOnDutyDrivers($pickupRequest, $passenger);
            } catch (\Throwable $e) {
                \Log::error('notifyOnDutyDrivers failed: ' . $e->getMessage());
            }

            try {
                $this->logDriverNotification($pickupRequest, $notificationMessage);
            } catch (\Throwable $e) {
                \Log::error('logDriverNotification failed: ' . $e->getMessage());
            }
        });

        return $pickupRequest->fresh();
    }

    /**
     * Resolve the active shuttle assigned to a route (assumes one active
     * shuttle per route — see plan note if a route can have several).
     */
    private function activeShuttleForRoute(int $routeId): ?Shuttle
    {
        return Shuttle::where('route_id', $routeId)
            ->where('status', 'active')
            ->first();
    }

    /**
     * Accept the request if the route's active shuttle has a free seat,
     * otherwise leave it queued and stamp its waiting position.
     */
    private function placeInQueue(PickupRequest $pickupRequest): void
    {
        $shuttle = $this->activeShuttleForRoute($pickupRequest->route_id);

        if (! $shuttle || ! $shuttle->driver_id) {
            // No shuttle/driver yet — keep it pending, position it in queue.
            $pickupRequest->update([
                'queue_position' => $this->nextQueuePosition($pickupRequest->route_id),
            ]);

            return;
        }

        $capacity = (int) ($shuttle->capacity ?? 0);

        // Seats already taken = active requests on this route that are not
        // still waiting (accepted or in_progress), excluding this one.
        $taken = PickupRequest::where('route_id', $pickupRequest->route_id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->where('id', '!=', $pickupRequest->id)
            ->count();

        if ($taken < $capacity) {
            // Free seat → auto-accept and assign the shuttle's driver.
            $this->driverAssignments->assignToPickupRequest(
                $shuttle->driver_id,
                $pickupRequest,
                'active',
            );
            $pickupRequest->update(['queue_position' => null]);

            return;
        }

        // Full → stays pending, gets a queue position.
        $pickupRequest->update([
            'queue_position' => $this->nextQueuePosition($pickupRequest->route_id),
        ]);
    }

    private function nextQueuePosition(int $routeId): int
    {
        return (int) PickupRequest::where('route_id', $routeId)
            ->where('status', 'pending')
            ->max('queue_position') + 1;
    }

    /**
     * Free a seat (after a no-show / decline at boarding) and promote the
     * next waiting passenger on the route to 'accepted'.
     */
    public function promoteNextInQueue(int $routeId): ?PickupRequest
    {
        $shuttle = $this->activeShuttleForRoute($routeId);
        if (! $shuttle || ! $shuttle->driver_id) {
            return null;
        }

        $next = PickupRequest::queuedForRoute($routeId)
            ->where('pickup_requests.status', 'pending')
            ->orderBy('pickup_requests.queue_position', 'asc')
            ->first();

        if (! $next) {
            return null;
        }

        $this->driverAssignments->assignToPickupRequest(
            $shuttle->driver_id,
            $next,
            'active',
        );
        $next->update(['queue_position' => null]);

        $tokens = DeviceToken::expoTokensForUser($next->user);
        if (! empty($tokens)) {
            $this->expoPush->send(
                $tokens,
                "You're next",
                'A seat just opened up — your driver is on the way.',
                ['type' => 'ride_accepted', 'pickup_request_id' => $next->id],
            );
        }

        return $next->fresh();
    }

    /**
     * Hybrid-ordered active queue for a route (stop sequence, then FCFS).
     */
    public function queueForRoute(int $routeId)
    {
        return PickupRequest::queuedForRoute($routeId)
            ->with(['user', 'pickupStop', 'dropoffStop'])
            ->get();
    }

    /**
     * Write a driver-facing notification log entry and push it to the
     * on-duty driver of the request's route.
     */
    public function logDriverNotification(PickupRequest $pickupRequest, string $message): void
    {
        Notification::create([
            'title' => 'Passenger update',
            'message' => $message,
            'type' => 'alert',
            'audience' => 'drivers',
            'status' => 'sent',
            'route_id' => $pickupRequest->route_id,
            'sent_at' => now(),
        ]);

        $driverUserIds = [];
        $shuttle = $this->activeShuttleForRoute($pickupRequest->route_id);
        if ($shuttle?->driver_id) {
            $driver = Driver::where('id', $shuttle->driver_id)
                ->where('is_available', true)
                ->whereNotNull('user_id')
                ->first();
            if ($driver) {
                $driverUserIds = [$driver->user_id];
            }
        }

        $tokens = DeviceToken::expoTokensForUserIds($driverUserIds);
        if (! empty($tokens)) {
            $this->expoPush->send(
                $tokens,
                'Passenger update',
                $message,
                ['type' => 'driver_log', 'pickup_request_id' => $pickupRequest->id],
            );
        }
    }

    /**
     * Push a "new pickup request" alert to the on-duty driver of the request's route.
     */
    private function notifyOnDutyDrivers(PickupRequest $pickupRequest, $passenger): void
    {
        $shuttle = $this->activeShuttleForRoute($pickupRequest->route_id);
        if (! $shuttle || ! $shuttle->driver_id) {
            return;
        }

        $driver = Driver::where('id', $shuttle->driver_id)
            ->where('is_available', true)
            ->whereNotNull('user_id')
            ->first();

        if (! $driver) {
            return;
        }

        $tokens = DeviceToken::expoTokensForUserIds([$driver->user_id]);
        if (empty($tokens)) {
            return;
        }

        $routeName = $pickupRequest->route?->name ?? 'a route';

        $this->expoPush->send(
            $tokens,
            'New pickup request',
            ($passenger->full_name ?? 'A passenger').' requested a pickup on '.$routeName.'.',
            ['type' => 'pickup_request', 'pickup_request_id' => $pickupRequest->id],
        );
    }

    /**
     * Shuttle GPS radius (metres) that triggers an auto-complete for any
     * boarded passenger whose dropoff stop is this close.  10 m is tight
     * enough to be deliberate but forgiving of typical consumer GPS error.
     */
    private const DROPOFF_AUTO_COMPLETE_METERS = 10;

    /**
     * Called on every driver GPS ping.  Finds all in-progress rides on this
     * shuttle's route and completes any whose dropoff stop is within the
     * threshold distance — no driver tap required.
     *
     * A fresh-read status guard prevents a double-complete if the driver
     * also taps "Arrived at Stop" at the same moment.
     */
    public function autoCompleteNearDropoff(int $shuttleId, float $lat, float $lng): void
    {
        $shuttle = Shuttle::find($shuttleId);
        if (! $shuttle?->route_id) {
            return;
        }

        $inProgress = PickupRequest::with([
            'dropoffStop',
            'pickupStop',
            'user.passenger',
            'assignment.driver.user',
        ])
            ->where('route_id', $shuttle->route_id)
            ->where('status', 'in_progress')
            ->get();

        foreach ($inProgress as $request) {
            $dropoff = $request->dropoffStop;
            if (! $dropoff?->latitude || ! $dropoff?->longitude) {
                continue;
            }

            $meters = Geo::distanceMeters(
                $lat, $lng,
                (float) $dropoff->latitude,
                (float) $dropoff->longitude,
            );

            if ($meters > self::DROPOFF_AUTO_COMPLETE_METERS) {
                continue;
            }

            // Re-read to guard against a concurrent manual "Arrived at Stop".
            if ($request->fresh()?->status !== 'in_progress') {
                continue;
            }

            $passengerName = $request->user?->full_name ?? 'Passenger';

            if ($request->assignment) {
                $this->driverAssignments->updateStatus($request->assignment, 'completed');
            } else {
                $request->update(['status' => 'completed', 'completed_at' => now()]);
            }

            try {
                broadcast(new RideCompleted(
                    $request->fresh(['user.passenger', 'assignment.driver.user'])
                ));
            } catch (\Throwable $e) {
                \Log::error('RideCompleted auto-complete broadcast failed: '.$e->getMessage());
            }

            $this->logDriverNotification(
                $request->fresh(['user', 'pickupStop']),
                $passengerName.' auto-completed at '.$dropoff->name.'.',
            );
        }
    }

    private function calculateETA($driverLat, $driverLng, $passengerLat, $passengerLng): int
    {
        // Haversine-based ETA (assumes 30 km/h average shuttle speed).
        // OSRM was removed: the public demo server adds unpredictable
        // latency (up to 3s) synchronously in the booking request path,
        // contributing to Heroku 30s timeouts.
        return $this->haversineETA($driverLat, $driverLng, $passengerLat, $passengerLng);
    }

    private function haversineETA($driverLat, $driverLng, $passengerLat, $passengerLng): int
    {
        /**
         * Fallback ETA calculation using Haversine formula.
         * Assumes 30 km/h average shuttle speed.
         */
        /*
         * Calculate ETA in minutes from driver's current position to passenger's pickup stop.
         * Uses the Haversine formula to compute distance, assumes 30 km/h average shuttle speed.
         *
         * @param  float  $driverLat  Driver's current latitude
         * @param  float  $driverLng  Driver's current longitude
         * @param  float  $passengerLat  Pickup stop latitude
         * @param  float  $passengerLng  Pickup stop longitude
         * @return int ETA in minutes
         */
        $earthRadius = 6371;
        $dLat = deg2rad($passengerLat - $driverLat);
        $dLng = deg2rad($passengerLng - $driverLng);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($driverLat)) * cos(deg2rad($passengerLat)) *
            sin($dLng / 2) * sin($dLng / 2);
        $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));

        return (int) round(($distance / 30) * 60);
    }
}

