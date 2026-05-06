<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Stop::with('route')->orderBy('route_id')->orderBy('sequence', 'asc');

        // Optionally filter by route
        if ($request->filled('route_id')) {
            $query->where('route_id', $request->route_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'name' => 'required|string|max:255',
            'sequence' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('stops')->where(function ($query) use ($request) {
                    return $query->where('route_id', $request->route_id);
                }),
            ],
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        $stop = Stop::create($validated);

        return response()->json($stop, 201);
    }

    public function show(Stop $stop): JsonResponse
    {
        return response()->json($stop->load('route'));
    }

    public function update(Request $request, Stop $stop): JsonResponse
    {
        $validated = $request->validate([
            'route_id' => 'sometimes|exists:routes,id',
            'name' => 'sometimes|string|max:255',
            'sequence' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::unique('stops')->where(function ($query) use ($request, $stop) {
                    $routeId = $request->input('route_id', $stop->route_id);

                    return $query->where('route_id', $routeId);
                })->ignore($stop->id),
            ],
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'is_active' => 'boolean',
        ]);

        $stop->update($validated);

        return response()->json($stop);
    }

    public function destroy(Stop $stop): JsonResponse
    {
        $stop->delete();

        return response()->json(['message' => 'Stop deleted successfully']);
    }
}
