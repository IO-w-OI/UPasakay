<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index()
    {
        return response()->json(Driver::with('user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:drivers,user_id',
            'license_number' => 'required|string|unique:drivers,license_number',
            'is_available' => 'boolean',
        ]);

        $driver = Driver::create($validated);

        return response()->json($driver, 201);
    }

    public function show(Driver $driver)
    {
        return response()->json($driver->load('user'));
    }

    public function update(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'license_number' => 'sometimes|string|unique:drivers,license_number,'.$driver->id,
            'is_available' => 'boolean',
        ]);

        $driver->update($validated);

        return response()->json($driver);
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();

        return response()->json(['message' => 'Driver deleted successfully']);
    }
}
