<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\Shuttle;
use App\Models\ShuttleLocation;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index()
    {
        // Routes that currently have a driver on duty (active shuttle +
        // driver is_available). Passenger Home uses this to grey out routes
        // they cannot book — same gate PickupRequestService enforces.
        $activeRouteIds = Shuttle::query()
            ->where('status', 'active')
            ->whereNotNull('driver_id')
            ->whereHas('driver', fn ($q) => $q->where('is_available', true))
            ->pluck('route_id')
            ->unique();

        $routes = Route::with('stops')->get()->map(function ($route) use ($activeRouteIds) {
            $payload = $route->toArray();
            $payload['has_active_driver'] = $activeRouteIds->contains($route->id);

            return $payload;
        });

        return response()->json($routes);
    }

    /**
     * Live positions of the active shuttle(s) on this route, for the
     * passenger map. Returns only shuttles that have reported a GPS
     * location; the mobile client polls this and also listens on the
     * `shuttle-locations` Pusher channel for between-poll updates.
     */
    public function shuttles(Route $route)
    {
        $shuttles = Shuttle::where('route_id', $route->id)
            ->where('status', 'active')
            ->get()
            ->map(function (Shuttle $shuttle) {
                $loc = ShuttleLocation::where('shuttle_id', $shuttle->id)
                    ->latest('recorded_at')
                    ->first();

                if (! $loc) {
                    return null;
                }

                return [
                    'id' => $shuttle->id,
                    'shuttle_code' => $shuttle->shuttle_code,
                    'status' => $shuttle->status,
                    'latitude' => (float) $loc->latitude,
                    'longitude' => (float) $loc->longitude,
                    'speed_kmh' => $loc->speed_kmh !== null ? (float) $loc->speed_kmh : null,
                    'recorded_at' => $loc->recorded_at,
                ];
            })
            ->filter()
            ->values();

        return response()->json($shuttles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_location' => 'required|string|max:255',
            'end_location' => 'required|string|max:255',
            'distance_km' => 'nullable|numeric',
            'estimated_duration_minutes' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $route = Route::create($validated);

        return response()->json($route, 201);
    }

    public function show(Route $route)
    {
        return response()->json($route->load('stops'));
    }

    public function update(Request $request, Route $route)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_location' => 'sometimes|string|max:255',
            'end_location' => 'sometimes|string|max:255',
            'distance_km' => 'nullable|numeric',
            'estimated_duration_minutes' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $route->update($validated);

        return response()->json($route);
    }

    public function destroy(Route $route)
    {
        $route->delete();

        return response()->json(['message' => 'Route deleted successfully']);
    }
}
