<?php

namespace App\Services;

use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PickupRequestService
{
    /**
     * Create a new pickup request for an authenticated user.
     * Prevents duplicate submissions for active bookings.
     *
     * @param User $user The authenticated user
     * @param array $data Validated request data containing route_id, pickup_stop_id, dropoff_stop_id
     * @return PickupRequest
     * @throws ValidationException if a duplicate active booking exists
     */
    public function createPickupRequest(User $user, array $data): PickupRequest
    {
        // Check if user has a valid passenger profile
        if (!$user->passenger) {
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

        return $pickupRequest;
    }
}
