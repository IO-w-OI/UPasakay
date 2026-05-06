<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shuttle;
use Illuminate\Http\Request;

class ShuttleController extends Controller
{
    public function index()
    {
        return response()->json(Shuttle::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|unique:shuttles,plate_number',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $shuttle = Shuttle::create($validated);

        return response()->json($shuttle, 201);
    }

    public function show(Shuttle $shuttle)
    {
        return response()->json($shuttle->load('locations'));
    }

    public function update(Request $request, Shuttle $shuttle)
    {
        $validated = $request->validate([
            'plate_number' => 'sometimes|string|unique:shuttles,plate_number,'.$shuttle->id,
            'capacity' => 'sometimes|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $shuttle->update($validated);

        return response()->json($shuttle);
    }

    public function destroy(Shuttle $shuttle)
    {
        $shuttle->delete();

        return response()->json(['message' => 'Shuttle deleted successfully']);
    }
}
