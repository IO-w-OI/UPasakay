<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DriverTripController extends Controller
{
    /**
     * Valid trip status values
     */
    private const VALID_STATUSES = ['idle', 'en_route', 'arrived', 'completed'];

    /**
     * Update driver's current trip status.
     * 
     * Accepts valid trip status values only: idle, en_route, arrived, completed.
     * Status updates are stored successfully.
     * Invalid status values are rejected.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function updateTripStatus(Request $request): JsonResponse
    {
        // Validate input
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(self::VALID_STATUSES)
            ],
            'notes' => 'nullable|string|max:255',
        ], [
            'status.required' => 'Trip status is required',
            'status.in' => 'Invalid status. Valid values are: ' . implode(', ', self::VALID_STATUSES),
        ]);

        // Get authenticated driver
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Driver authentication required.',
            ], 401);
        }

        // Find driver associated with authenticated user
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found for authenticated user.',
            ], 403);
        }

        // Find or create the active trip for this driver
        $trip = Trip::where('driver_id', $driver->id)
            ->where('status', '!=', 'completed')
            ->latest('created_at')
            ->first();

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'No active trip found for driver. Please start a trip first.',
            ], 404);
        }

        // Handle status transition
        $oldStatus = $trip->status;
        
        // Update timestamps based on status transitions
        if ($validated['status'] === 'en_route' && !$trip->started_at) {
            $trip->started_at = now();
        }
        if ($validated['status'] === 'completed') {
            $trip->completed_at = now();
        }

        // Update the status
        $trip->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trip status updated successfully',
            'data' => [
                'trip_id' => $trip->id,
                'driver_id' => $trip->driver_id,
                'shuttle_id' => $trip->shuttle_id,
                'route_id' => $trip->route_id,
                'previous_status' => $oldStatus,
                'current_status' => $trip->status,
                'started_at' => $trip->started_at,
                'completed_at' => $trip->completed_at,
                'updated_at' => $trip->updated_at,
            ]
        ], 200);
    }

    /**
     * Start a new trip for the driver.
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function startTrip(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shuttle_id' => 'required|exists:shuttles,id',
            'route_id' => 'required|exists:routes,id',
        ]);

        // Get authenticated driver
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Driver authentication required.',
            ], 401);
        }

        // Find driver associated with authenticated user
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found for authenticated user.',
            ], 403);
        }

        // Check if driver already has an active trip
        $existingTrip = Trip::where('driver_id', $driver->id)
            ->where('status', '!=', 'completed')
            ->exists();

        if ($existingTrip) {
            return response()->json([
                'success' => false,
                'message' => 'Driver already has an active trip.',
            ], 409);
        }

        // Create new trip
        $trip = Trip::create([
            'driver_id' => $driver->id,
            'shuttle_id' => $validated['shuttle_id'],
            'route_id' => $validated['route_id'],
            'status' => 'idle',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trip started successfully',
            'data' => [
                'trip_id' => $trip->id,
                'driver_id' => $trip->driver_id,
                'shuttle_id' => $trip->shuttle_id,
                'route_id' => $trip->route_id,
                'status' => $trip->status,
                'created_at' => $trip->created_at,
            ]
        ], 201);
    }

    /**
     * Get current trip status for authenticated driver.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getCurrentTrip(Request $request): JsonResponse
    {
        // Get authenticated driver
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Driver authentication required.',
            ], 401);
        }

        // Find driver associated with authenticated user
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found for authenticated user.',
            ], 403);
        }

        // Find the active trip for this driver
        $trip = Trip::where('driver_id', $driver->id)
            ->where('status', '!=', 'completed')
            ->with(['shuttle', 'route'])
            ->latest('created_at')
            ->first();

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'No active trip found',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Current trip retrieved',
            'data' => [
                'trip_id' => $trip->id,
                'driver_id' => $trip->driver_id,
                'shuttle' => [
                    'id' => $trip->shuttle->id,
                    'code' => $trip->shuttle->shuttle_code,
                    'plate_number' => $trip->shuttle->plate_number,
                ],
                'route' => [
                    'id' => $trip->route->id,
                    'name' => $trip->route->name,
                    'start_location' => $trip->route->start_location,
                    'end_location' => $trip->route->end_location,
                ],
                'status' => $trip->status,
                'started_at' => $trip->started_at,
                'completed_at' => $trip->completed_at,
                'created_at' => $trip->created_at,
                'updated_at' => $trip->updated_at,
            ]
        ], 200);
    }

    /**
     * End the current trip for the driver.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function endTrip(Request $request): JsonResponse
    {
        // Get authenticated driver
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Driver authentication required.',
            ], 401);
        }

        // Find driver associated with authenticated user
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found for authenticated user.',
            ], 403);
        }

        // Find the active trip for this driver
        $trip = Trip::where('driver_id', $driver->id)
            ->where('status', '!=', 'completed')
            ->latest('created_at')
            ->first();

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'No active trip found to end',
            ], 404);
        }

        // End the trip
        $trip->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trip ended successfully',
            'data' => [
                'trip_id' => $trip->id,
                'status' => $trip->status,
                'completed_at' => $trip->completed_at,
            ]
        ], 200);
    }

    /**
     * Get trip status for passenger-facing screens.
     * Allows passengers to see real-time trip status.
     * 
     * @param Request $request
     * @param int $tripId
     * @return JsonResponse
     */
    public function getTripStatus(Request $request, int $tripId): JsonResponse
    {
        $trip = Trip::with(['driver.user', 'shuttle', 'route'])
            ->findOrFail($tripId);

        return response()->json([
            'success' => true,
            'message' => 'Trip status retrieved',
            'data' => [
                'trip_id' => $trip->id,
                'driver' => [
                    'id' => $trip->driver->id,
                    'full_name' => $trip->driver->full_name,
                ],
                'shuttle' => [
                    'id' => $trip->shuttle->id,
                    'plate_number' => $trip->shuttle->plate_number,
                ],
                'route' => [
                    'id' => $trip->route->id,
                    'name' => $trip->route->name,
                ],
                'status' => $trip->status,
                'started_at' => $trip->started_at,
                'completed_at' => $trip->completed_at,
            ]
        ], 200);
    }
}
