<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Passenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user instanceof Passenger) {
            $user = $user->user;
            if (! $user) {
                return response()->json(['message' => 'User account not found.'], 422);
            }
        }
        $driver = Driver::where('user_id', $user->getKey())->first();

        if ($driver) {
            return response()->json([
                'success' => true,
                'role' => 'driver',
                'data' => [
                    'id' => $driver->id,
                    'full_name' => $driver->full_name,
                    'email' => $user->email,
                    'license_number' => $driver->license_number,
                    'driver_status' => $driver->displayStatus(),
                    'is_suspended' => (bool) $driver->is_suspended,
                ],
            ]);
        }

        $passenger = Passenger::where('user_id', $user->getKey())->first();

        return response()->json([
            'success' => true,
            'role' => 'passenger',
            'data' => [
                'id' => $passenger?->id,
                'full_name' => $passenger?->full_name,
                'email' => $user->email,
                'passenger_type' => $passenger?->passenger_type,
                'department_office' => $passenger?->department_office,
                'verification_status' => $passenger?->verification_status,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user instanceof Passenger) {
            $user = $user->user;
            if (! $user) {
                return response()->json(['message' => 'User account not found.'], 422);
            }
        }
        $driver = Driver::where('user_id', $user->getKey())->first();

        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'password'  => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if ($driver) {
            if (isset($validated['full_name'])) {
                $driver->update(['full_name' => $validated['full_name']]);
                $user->update(['name' => $validated['full_name']]);
            }
            if (!empty($validated['password'])) {
                $user->update(['password_hash' => $validated['password']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'data' => [
                    'full_name' => $driver->fresh()->full_name,
                    'email' => $user->email,
                ],
            ]);
        }

        // Update passenger
        $passenger = Passenger::where('user_id', $user->getKey())->first();

        if (isset($validated['full_name']) && $passenger) {
            $passenger->update(['full_name' => $validated['full_name']]);
            $user->update(['name' => $validated['full_name']]);
        }
        if (!empty($validated['password'])) {
            $user->update(['password_hash' => $validated['password']]);
            $passenger?->update(['password_hash' => $validated['password']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => [
                'full_name' => $passenger?->fresh()->full_name,
                'email' => $user->email,
            ],
        ]);
    }
}
