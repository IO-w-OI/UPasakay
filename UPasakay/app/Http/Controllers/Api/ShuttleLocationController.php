<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShuttleLocation;
use App\Events\ShuttleLocationUpdated;
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

        
        broadcast(new ShuttleLocationUpdated(
            $validated['shuttle_id'],
            (float) $validated['latitude'],
            (float) $validated['longitude'],
        ));
        
        return response()->json($location, 201);
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
