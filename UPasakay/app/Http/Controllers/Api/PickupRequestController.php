<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use Illuminate\Http\Request;

class PickupRequestController extends Controller
{
    public function index()
    {
        return response()->json(
            PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop'])->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'route_id' => 'required|exists:routes,id',
            'pickup_stop_id' => 'required|exists:stops,id',
            'dropoff_stop_id' => 'required|exists:stops,id',
        ]);

        $validated['status'] = 'pending';
        $pickupRequest = PickupRequest::create($validated);
        return response()->json($pickupRequest, 201);
    }

    public function show(PickupRequest $pickupRequest)
    {
        return response()->json(
            $pickupRequest->load(['user', 'route', 'pickupStop', 'dropoffStop', 'assignment'])
        );
    }

    public function update(Request $request, PickupRequest $pickupRequest)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,assigned,completed,cancelled',
            'assigned_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
        ]);

        $pickupRequest->update($validated);
        return response()->json($pickupRequest);
    }

    public function destroy(PickupRequest $pickupRequest)
    {
        $pickupRequest->delete();
        return response()->json(['message' => 'Pickup request deleted successfully']);
    }
}