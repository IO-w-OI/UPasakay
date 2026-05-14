<?php

namespace App\Http\Controllers\Api;

use App\Events\ShuttleLocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Shuttle;
use App\Models\ShuttleLocation;
use Illuminate\Http\Request;

class ShuttleLocationController extends Controller
{
    public function index()
    {
        return response()->json(ShuttleLocation::with('shuttle')->latest('recorded_at')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shuttle_id' => 'required|exists:shuttles,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'speed_kmh' => 'nullable|numeric',
        ]);

        $location = ShuttleLocation::create($validated);
        \Log::info("📍 GPS Update - Shuttle: {$validated['shuttle_id']} | Lat: {$validated['latitude']} | Lng: {$validated['longitude']}");
                // --------------------------

        broadcast(new ShuttleLocationUpdated(
            $validated['shuttle_id'],
            (float) $validated['latitude'],
            (float) $validated['longitude'],
        ));

        return response()->json($location, 201);
    }

    /**
     * Mobile-friendly alias: POST /api/driver/location.
     * Accepts either driver_id (resolves to driver's shuttle) or shuttle_id.
     */
    public function storeFromDriver(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'nullable|integer|exists:drivers,id',
            'shuttle_id' => 'nullable|integer|exists:shuttles,id',
            'user_id'   => 'nullable|integer|exists:users,id',
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'speed_kmh' => 'nullable|numeric',
        ]);

        $shuttleId = isset($validated['shuttle_id']) ? (int) $validated['shuttle_id'] : null;
        $driverIdInput = isset($validated['driver_id']) ? (int) $validated['driver_id'] : null;

        // Resolve driver from user_id when driver_id is not provided
        if ($driverIdInput === null && $shuttleId === null && isset($validated['user_id'])) {
            $driver = Driver::query()->with('shuttle')->where('user_id', (int) $validated['user_id'])->first();
            if ($driver === null) {
                return response()->json(['message' => 'No driver record found for this user.'], 422);
            }
            $driverIdInput = $driver->id;
        }

        if ($shuttleId === null && $driverIdInput === null) {
            return response()->json(['message' => 'Provide driver_id, shuttle_id, or user_id.'], 422);
        }

        if ($shuttleId === null && $driverIdInput !== null) {
            $driver = Driver::query()->with('shuttle')->findOrFail($driverIdInput);
            $shuttle = $driver->shuttle;
            if ($shuttle === null) {
                return response()->json([
                    'message' => 'Driver has no shuttle assigned.',
                ], 422);
            }
            $shuttleId = $shuttle->id;
        }

        if ($shuttleId === null) {
            return response()->json([
                'message' => 'Either driver_id or shuttle_id is required.',
            ], 422);
        }

        if ($driverIdInput !== null) {
            $shuttle = Shuttle::query()->find($shuttleId);
            if ($shuttle !== null && $shuttle->driver_id !== null && $shuttle->driver_id !== $driverIdInput) {
                return response()->json([
                    'message' => 'driver_id does not match the shuttle\'s assigned driver.',
                ], 422);
            }
        }

        $shuttle = Shuttle::query()->findOrFail($shuttleId);
        $resolvedDriverId = $shuttle->driver_id;

        $location = ShuttleLocation::create([
            'shuttle_id' => $shuttleId,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'speed_kmh' => $validated['speed_kmh'] ?? null,
        ]);

        broadcast(new ShuttleLocationUpdated(
            $shuttleId,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
        ));

        return response()->json(array_merge($location->toArray(), [
            'shuttle_id' => $shuttleId,
            'driver_id' => $resolvedDriverId,
        ]), 201);
    }

    public function show(ShuttleLocation $shuttleLocation)
    {
        return response()->json($shuttleLocation->load('shuttle'));
    }

    public function update(Request $request, ShuttleLocation $shuttleLocation)
    {
        $validated = $request->validate([
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'speed_kmh' => 'nullable|numeric',
        ]);

        $shuttleLocation->update($validated);

        return response()->json($shuttleLocation);
    }

    public function destroy(ShuttleLocation $shuttleLocation)
    {
        $shuttleLocation->delete();

        return response()->json(['message' => 'Location record deleted successfully']);
    }
}
