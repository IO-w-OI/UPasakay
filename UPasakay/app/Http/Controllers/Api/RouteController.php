<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index()
    {
        return response()->json(Route::with('stops')->get());
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