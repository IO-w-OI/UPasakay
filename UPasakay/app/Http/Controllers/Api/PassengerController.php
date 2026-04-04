<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePassengerRequest;
use App\Http\Requests\UpdatePassengerRequest;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class PassengerController extends Controller
{
    /**
     * Display a paginated list of passengers.
     */
    public function index(): JsonResponse
    {
        $passengers = Passenger::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($passengers);
    }

    /**
     * Store a newly created passenger (and its associated user).
     */
    public function store(StorePassengerRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Create the underlying user account
        $user = User::create([
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
        ]);

        // Create the passenger profile linked to the user
        $passenger = Passenger::create([
            'user_id' => $user->id,
            'passenger_number' => $validated['passenger_number'],
            'department' => $validated['department'] ?? null,
            'passenger_type' => $validated['passenger_type'] ?? 'student',
            'passenger_status' => 'pending',
        ]);

        $passenger->load('user');

        return response()->json([
            'message' => 'Passenger created successfully.',
            'data' => $passenger,
        ], 201);
    }

    /**
     * Display the specified passenger.
     */
    public function show(string $id): JsonResponse
    {
        $passenger = Passenger::with('user')->where('user_id', $id)->first();

        if (! $passenger) {
            return response()->json(['message' => 'Passenger not found.'], 404);
        }

        return response()->json(['data' => $passenger]);
    }

    /**
     * Update the specified passenger.
     */
    public function update(UpdatePassengerRequest $request, string $id): JsonResponse
    {
        $passenger = Passenger::with('user')->where('user_id', $id)->first();

        if (! $passenger) {
            return response()->json(['message' => 'Passenger not found.'], 404);
        }

        $validated = $request->validated();

        // Update passenger fields
        $passenger->update(array_intersect_key($validated, array_flip([
            'passenger_number', 'department', 'passenger_type',
        ])));

        // Update user email if provided
        if (isset($validated['email']) && $passenger->user) {
            $passenger->user->update(['email' => $validated['email']]);
        }

        $passenger->load('user');

        return response()->json([
            'message' => 'Passenger updated successfully.',
            'data' => $passenger,
        ]);
    }

    /**
     * Remove the specified passenger (soft-delete via removing the record).
     */
    public function destroy(string $id): JsonResponse
    {
        $passenger = Passenger::where('user_id', $id)->first();

        if (! $passenger) {
            return response()->json(['message' => 'Passenger not found.'], 404);
        }

        $passenger->delete();

        return response()->json(['message' => 'Passenger deleted successfully.']);
    }
}
