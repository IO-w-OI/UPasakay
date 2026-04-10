<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverAssignment;
use App\Services\DriverAssignmentService;
use Illuminate\Http\Request;
use InvalidArgumentException;

class DriverAssignmentController extends Controller
{
    public function __construct(private readonly DriverAssignmentService $assignmentService)
    {
    }

    public function index()
    {
        return response()->json(
            DriverAssignment::with(['driver', 'pickupRequest'])->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'pickup_request_id' => 'required|exists:pickup_requests,id',
            'status' => 'sometimes|in:active,completed,cancelled',
        ]);

        try {
            $assignment = $this->assignmentService->assignByIds(
                $validated['driver_id'],
                $validated['pickup_request_id'],
                $validated['status'] ?? 'active',
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

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

        if (array_key_exists('status', $validated)) {
            $driverAssignment = $this->assignmentService->updateStatus($driverAssignment, $validated['status']);
        } else {
            $driverAssignment = $driverAssignment->fresh(['driver', 'pickupRequest']);
        }

        return response()->json($driverAssignment);
    }

    public function destroy(DriverAssignment $driverAssignment)
    {
        $this->assignmentService->delete($driverAssignment);

        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}