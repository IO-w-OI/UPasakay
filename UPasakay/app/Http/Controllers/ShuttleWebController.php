<?php

namespace App\Http\Controllers;

use App\Models\Shuttle;
use Illuminate\Http\Request;

class ShuttleWebController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shuttle_code' => 'required|string|max:50|unique:shuttles,shuttle_code',
            'shuttle_type' => 'required|string|in:van,minibus,bus',
            'plate_number' => 'required|string|max:20|unique:shuttles,plate_number',
            'capacity'     => 'required|integer|min:1|max:100',
        ]);

        Shuttle::create(array_merge($validated, ['status' => 'idle', 'is_active' => false]));

        return back()->with('success', 'Shuttle created successfully.');
    }

    public function update(Request $request, Shuttle $shuttle)
    {
        $request->validate([
            'shuttle_type' => 'sometimes|string|in:van,minibus,bus',
            'plate_number' => 'sometimes|string|max:20',
            'capacity' => 'sometimes|integer|min:1|max:100',
            'status' => 'sometimes|string|in:active,idle,offline,maintenance',
            'route_id' => 'nullable|integer|exists:routes,id',
            'driver_id' => 'nullable|integer|exists:drivers,id',
        ]);

        // Conflict check: if assigning a driver, make sure they aren't assigned elsewhere
        if ($request->has('driver_id') && $request->driver_id) {
            $existing = Shuttle::where('driver_id', $request->driver_id)
                ->where('id', '!=', $shuttle->id)
                ->first();
            if ($existing) {
                return back()->withErrors([
                    'driver_id' => "This driver is already assigned to {$existing->shuttle_code}.",
                ]);
            }
        }

        $shuttle->update($request->only([
            'shuttle_type',
            'plate_number',
            'capacity',
            'status',
            'route_id',
            'driver_id',
        ]));

        // Sync is_active from status
        $shuttle->update([
            'is_active' => in_array($shuttle->status, ['active', 'idle']),
        ]);

        return back()->with('success', 'Shuttle updated successfully.');
    }

    public function assignDriver(Request $request, Shuttle $shuttle)
    {
        $request->validate([
            'driver_id' => 'nullable|integer|exists:drivers,id',
        ]);

        // Conflict check
        if ($request->driver_id) {
            $existing = Shuttle::where('driver_id', $request->driver_id)
                ->where('id', '!=', $shuttle->id)
                ->first();
            if ($existing) {
                return back()->withErrors([
                    'driver_id' => "This driver is already assigned to {$existing->shuttle_code}.",
                ]);
            }
        }

        $shuttle->update(['driver_id' => $request->driver_id]);

        return back()->with('success', $request->driver_id ? 'Driver assigned.' : 'Driver unassigned.');
    }

    public function updateStatus(Request $request, Shuttle $shuttle)
    {
        $request->validate([
            'status' => 'required|string|in:active,idle,offline,maintenance',
        ]);

        $shuttle->update([
            'status' => $request->status,
            'is_active' => in_array($request->status, ['active', 'idle']),
        ]);

        return back()->with('success', 'Shuttle status updated.');
    }

    public function destroy(Shuttle $shuttle)
    {
        $shuttle->update(['driver_id' => null]);
        $shuttle->delete();

        return back()->with('success', 'Shuttle removed successfully.');
    }
}
