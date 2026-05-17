<?php

namespace App\Services;

use App\Models\DeviceToken;
use App\Models\Driver;
use App\Models\Notification;
use App\Models\PickupRequest;
use App\Models\Shuttle;
use App\Models\ShuttleLocation;
use App\Models\Stop;
use App\Models\User;
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
            $pickupRequest->eta_minutes = $this->calculateETA(
                $latestLocation->latitude,
                $latestLocation->longitude,
                $pickupStop->latitude,
                $pickupStop->longitude
            );
            $pickupRequest->save();
        }

        $pickupRequest->load('pickupStop');

        $this->notifyOnDutyDrivers($pickupRequest, $passenger);

        // Capacity-gated auto-accept: if the route's active shuttle still has
        // free seats, accept immediately and assign its driver. Otherwise the
        // request waits in the route queue (status stays 'pending').
        $this->placeInQueue($pickupRequest);

        $this->logDriverNotification(
            $pickupRequest,
            ($passenger->full_name ?? 'A passenger').' is waiting at '
                .($pickupRequest->pickupStop?->name ?? 'a stop')
                .($pickupRequest->pickupStop?->sequence !== null
                    ? ' (Stop '.((int) $pickupRequest->pickupStop->sequence + 1).')'
                    : '')
                .'.'
        );

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
     * Write a driver-facing notification log entry and push it to on-duty
     * drivers. Reuses the existing Notification model + Expo push pipeline.
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

        $driverUserIds = Driver::where('is_available', true)
            ->whereNotNull('user_id')
            ->pluck('user_id')
            ->all();

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
     * Push a "new pickup request" alert to every on-duty driver, alongside
     * the existing Pusher channel listeners (not a replacement for them).
     */
    private function notifyOnDutyDrivers(PickupRequest $pickupRequest, $passenger): void
    {
        $driverUserIds = Driver::where('is_available', true)
            ->whereNotNull('user_id')
            ->pluck('user_id')
            ->all();

        $tokens = DeviceToken::expoTokensForUserIds($driverUserIds);

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

    private function calculateETA($driverLat, $driverLng, $passengerLat, $passengerLng): int
    { // Calculates ETA based on Haversine Formula and location of both passenger and driver
        /**
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
