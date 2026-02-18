<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverAssignment;
use Illuminate\Http\Request;

class DriverAssignmentController extends Controller
{
    public function index()
    {
        return response()->json(
            DriverAssignment::with(['driver', 'pickupRequest'])->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,user_id',
            'pickup_request_id' => 'required|exists:pickup_requests,id',
            'status' => 'in:active,completed,cancelled',
        ]);

        $assignment = DriverAssignment::create($validated);
        return response()->json($assignment, 201);
    }

    public function show(DriverAssignment $driverAssignment)
    {
        return response()->json($driverAssignment->load(['driver', 'pickupRequest']));
    }

    public function update(Request $request, DriverAssignment $driverAssignment)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:active,completed,cancelled',
        ]);

        $driverAssignment->update($validated);
        return response()->json($driverAssignment);
    }

    public function destroy(DriverAssignment $driverAssignment)
    {
        $driverAssignment->delete();
        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}