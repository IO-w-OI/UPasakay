<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Services\PickupRequestService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PickupRequestController extends Controller
{
    private PickupRequestService $pickupRequestService;

    public function __construct(PickupRequestService $pickupRequestService)
    {
        $this->pickupRequestService = $pickupRequestService;
    }

    public function index()
    {
        return response()->json(
            PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop'])->get()
        );
    }

    public function store(Request $request)
    {
        // Validate only the required fields for the mobile app and web requests
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'pickup_stop_id' => 'required|exists:stops,id',
            'dropoff_stop_id' => 'required|exists:stops,id',
        ]);

        // Get the authenticated user from the request token/session
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Validate passenger status and check for duplicates
        try {
            $pickupRequest = $this->pickupRequestService->createPickupRequest($user, $validated);
            return response()->json($pickupRequest, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
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
            'status' => 'sometimes|in:pending,accepted,in_progress,completed,cancelled',
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
