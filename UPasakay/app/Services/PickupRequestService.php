<?php

namespace App\Services;

use App\Models\DeviceToken;
use App\Models\Driver;
use App\Models\PickupRequest;
use App\Models\ShuttleLocation;
use App\Models\Stop;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PickupRequestService
{
    public function __construct(
        private ExpoPushService $expoPush,
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

        $this->notifyOnDutyDrivers($pickupRequest, $passenger);

        return $pickupRequest;
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
