<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stop;
use Illuminate\Http\Request;

class StopController extends Controller
{
    public function index()
    {
        return response()->json(Stop::with('route')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        $stop = Stop::create($validated);
        return response()->json($stop, 201);
    }

    public function show(Stop $stop)
    {
        return response()->json($stop->load('route'));
    }

    public function update(Request $request, Stop $stop)
    {
        $validated = $request->validate([
            'route_id' => 'sometimes|exists:routes,id',
            'name' => 'sometimes|string|max:255',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'is_active' => 'boolean',
        ]);

        $stop->update($validated);
        return response()->json($stop);
    }

    public function destroy(Stop $stop)
    {
        $stop->delete();
        return response()->json(['message' => 'Stop deleted successfully']);
    }
}