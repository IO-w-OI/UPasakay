<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\ShuttleLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DriverLocationController extends Controller
{
    /**
     * Store driver's current GPS location.
     * 
     * Only authenticated drivers can send location updates.
     * Latest location is saved for the assigned shuttle.
     * Invalid coordinates are rejected with validation errors.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function updateLocation(Request $request): JsonResponse
    {
        // Validate input
        $validated = $request->validate([
            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
                'regex:/^-?\d+(\.\d{1,8})?$/' // Allow up to 8 decimal places
            ],
            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
                'regex:/^-?\d+(\.\d{1,8})?$/' // Allow up to 8 decimal places
            ],
            'speed_kmh' => 'nullable|numeric|min:0|max:300',
            'timestamp' => 'nullable|date_format:Y-m-d H:i:s|before_or_equal:now',
        ], [
            'latitude.required' => 'Latitude is required',
            'latitude.between' => 'Latitude must be between -90 and 90',
            'latitude.regex' => 'Latitude must be a valid decimal number',
            'longitude.required' => 'Longitude is required',
            'longitude.between' => 'Longitude must be between -180 and 180',
            'longitude.regex' => 'Longitude must be a valid decimal number',
            'speed_kmh.max' => 'Speed cannot exceed 300 km/h',
            'timestamp.before_or_equal' => 'Timestamp cannot be in the future',
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

        // Find the active shuttle assignment for this driver
        $shuttle = $driver->assignments()
            ->with('shuttle')
            ->where('status', '!=', 'completed')
            ->latest('created_at')
            ->first()
            ?->shuttle;

        if (!$shuttle) {
            return response()->json([
                'success' => false,
                'message' => 'No active shuttle assignment found for driver.',
            ], 404);
        }

        // Create location record
        $location = ShuttleLocation::create([
            'shuttle_id' => $shuttle->id,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'speed_kmh' => $validated['speed_kmh'] ?? null,
            'recorded_at' => $validated['timestamp'] ?? now(),
        ]);

        // Update shuttle's last_seen_at timestamp
        $shuttle->update(['last_seen_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data' => [
                'location_id' => $location->id,
                'shuttle_id' => $shuttle->id,
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'speed_kmh' => $location->speed_kmh,
                'recorded_at' => $location->recorded_at,
                'saved_at' => $location->created_at,
            ]
        ], 201);
    }

    /**
     * Get the latest location for a specific shuttle.
     * Useful for mobile app to verify location was saved.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getLatestLocation(Request $request): JsonResponse
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

        // Get latest location for driver's shuttle
        $location = ShuttleLocation::whereHas('shuttle', function ($query) use ($driver) {
            $query->whereHas('driver', function ($driverQuery) use ($driver) {
                $driverQuery->where('id', $driver->id);
            });
        })
        ->latest('recorded_at')
        ->first();

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'No location records found',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Latest location retrieved',
            'data' => [
                'location_id' => $location->id,
                'shuttle_id' => $location->shuttle_id,
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'speed_kmh' => $location->speed_kmh,
                'recorded_at' => $location->recorded_at,
            ]
        ], 200);
    }

    /**
     * Batch upload locations from mobile app.
     * Useful for syncing multiple location points at once.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function batchUpdateLocations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locations' => 'required|array|min:1|max:50',
            'locations.*.latitude' => [
                'required',
                'numeric',
                'between:-90,90',
                'regex:/^-?\d+(\.\d{1,8})?$/'
            ],
            'locations.*.longitude' => [
                'required',
                'numeric',
                'between:-180,180',
                'regex:/^-?\d+(\.\d{1,8})?$/'
            ],
            'locations.*.speed_kmh' => 'nullable|numeric|min:0|max:300',
            'locations.*.timestamp' => 'nullable|date_format:Y-m-d H:i:s|before_or_equal:now',
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

        // Find the active shuttle assignment for this driver
        $shuttle = $driver->assignments()
            ->with('shuttle')
            ->where('status', '!=', 'completed')
            ->latest('created_at')
            ->first()
            ?->shuttle;

        if (!$shuttle) {
            return response()->json([
                'success' => false,
                'message' => 'No active shuttle assignment found for driver.',
            ], 404);
        }

        // Batch create location records
        $locations = [];
        foreach ($validated['locations'] as $loc) {
            $locations[] = ShuttleLocation::create([
                'shuttle_id' => $shuttle->id,
                'latitude' => $loc['latitude'],
                'longitude' => $loc['longitude'],
                'speed_kmh' => $loc['speed_kmh'] ?? null,
                'recorded_at' => $loc['timestamp'] ?? now(),
            ]);
        }

        // Update shuttle's last_seen_at timestamp
        $shuttle->update(['last_seen_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => count($locations) . ' locations saved successfully',
            'data' => [
                'shuttle_id' => $shuttle->id,
                'locations_saved' => count($locations),
                'latest_location' => [
                    'latitude' => $locations[count($locations) - 1]->latitude,
                    'longitude' => $locations[count($locations) - 1]->longitude,
                    'recorded_at' => $locations[count($locations) - 1]->recorded_at,
                ]
            ]
        ], 201);
    }
}
