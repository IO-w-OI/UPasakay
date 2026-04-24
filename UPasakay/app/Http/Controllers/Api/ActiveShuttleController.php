<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shuttle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActiveShuttleController extends Controller
{
    /**
     * Get the currently active shuttle with route and driver details.
     * 
     * Returns only active shuttles that are currently en route or operational.
     * Includes route details, driver information, and trip metadata.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getActiveShuttle(Request $request): JsonResponse
    {
        // Optionally filter by route_id if provided
        $routeId = $request->query('route_id');

        $query = Shuttle::where('is_active', true)
            ->where('status', '!=', 'offline')
            ->with([
                'driver.user',
                'route.stops',
                'locations' => function ($query) {
                    $query->latest('recorded_at')->limit(1);
                }
            ]);

        if ($routeId) {
            $query->where('route_id', $routeId);
        }

        $shuttle = $query->first();

        if (!$shuttle) {
            return response()->json([
                'success' => false,
                'message' => 'No active shuttle found',
                'data' => null
            ], 404);
        }

        // Format response with comprehensive shuttle details
        return response()->json([
            'success' => true,
            'message' => 'Active shuttle retrieved successfully',
            'data' => [
                'shuttle' => [
                    'id' => $shuttle->id,
                    'code' => $shuttle->shuttle_code,
                    'plate_number' => $shuttle->plate_number,
                    'type' => $shuttle->shuttle_type,
                    'capacity' => $shuttle->capacity,
                    'status' => $shuttle->status, // active, idle, offline
                    'is_active' => $shuttle->is_active,
                ],
                'driver' => $shuttle->driver ? [
                    'id' => $shuttle->driver->id,
                    'full_name' => $shuttle->driver->full_name,
                    'license_number' => $shuttle->driver->license_number,
                    'status' => $shuttle->driver->driver_status,
                    'is_available' => $shuttle->driver->is_available,
                ] : null,
                'route' => $shuttle->route ? [
                    'id' => $shuttle->route->id,
                    'name' => $shuttle->route->name,
                    'start_location' => $shuttle->route->start_location,
                    'end_location' => $shuttle->route->end_location,
                    'distance_km' => $shuttle->route->distance_km,
                    'estimated_duration_minutes' => $shuttle->route->estimated_duration_minutes,
                    'is_active' => $shuttle->route->is_active,
                    'stops' => $shuttle->route->stops->map(function ($stop) {
                        return [
                            'id' => $stop->id,
                            'name' => $stop->name,
                            'latitude' => $stop->latitude,
                            'longitude' => $stop->longitude,
                            'sequence' => $stop->sequence,
                        ];
                    })->values(),
                ] : null,
                'last_location' => $shuttle->locations->isNotEmpty() ? [
                    'latitude' => $shuttle->locations[0]->latitude,
                    'longitude' => $shuttle->locations[0]->longitude,
                    'speed_kmh' => $shuttle->locations[0]->speed_kmh,
                    'recorded_at' => $shuttle->locations[0]->recorded_at,
                ] : null,
                'last_seen_at' => $shuttle->last_seen_at,
                'updated_at' => $shuttle->updated_at,
            ]
        ], 200);
    }

    /**
     * Get all active shuttles with minimal information.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllActiveShuttles(Request $request): JsonResponse
    {
        $shuttles = Shuttle::where('is_active', true)
            ->where('status', '!=', 'offline')
            ->with(['driver:id,full_name,driver_status', 'route:id,name'])
            ->get();

        if ($shuttles->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No active shuttles found',
                'data' => []
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Active shuttles retrieved successfully',
            'data' => $shuttles->map(function ($shuttle) {
                return [
                    'id' => $shuttle->id,
                    'code' => $shuttle->shuttle_code,
                    'plate_number' => $shuttle->plate_number,
                    'type' => $shuttle->shuttle_type,
                    'capacity' => $shuttle->capacity,
                    'status' => $shuttle->status,
                    'driver' => $shuttle->driver ? [
                        'id' => $shuttle->driver->id,
                        'full_name' => $shuttle->driver->full_name,
                        'status' => $shuttle->driver->driver_status,
                    ] : null,
                    'route' => $shuttle->route ? [
                        'id' => $shuttle->route->id,
                        'name' => $shuttle->route->name,
                    ] : null,
                ];
            })->values()
        ], 200);
    }
}
