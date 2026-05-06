<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePassengerRequest;
use App\Http\Requests\UpdatePassengerRequest;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\JsonResponse;

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

        // Optionally create an associated user when email/password provided
        $user = null;
        if (! empty($validated['email']) && ! empty($validated['password'])) {
            $user = User::create([
                'email' => $validated['email'],
                'password_hash' => $validated['password'],
            ]);
        }

        $passenger = Passenger::create([
            'user_id' => $user ? $user->id : null,
            'full_name' => $validated['full_name'] ?? null,
            'email' => $validated['email'] ?? null,
            'passenger_number' => $validated['passenger_number'],
            'department_office' => $validated['department_office'] ?? ($validated['department'] ?? null),
            'passenger_type' => $validated['passenger_type'] ?? 'student',
            'passenger_status' => 'pending',
            'verification_status' => 'pending',
            'phone_number' => $validated['phone_number'] ?? null,
            'student_id' => $validated['student_id'] ?? null,
            'employee_id' => $validated['employee_id'] ?? null,
            'proof_document_path' => $validated['proof_document_path'] ?? null,
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

        $updatable = array_intersect_key($validated, array_flip([
            'full_name',
            'passenger_number',
            'department_office',
            'department',
            'passenger_type',
            'phone_number',
            'student_id',
            'employee_id',
            'proof_document_path',
            'verification_status',
            'passenger_status',
        ]));

        // If legacy 'department' provided, set both columns for compatibility
        if (isset($validated['department'])) {
            $updatable['department'] = $validated['department'];
            if (! isset($updatable['department_office'])) {
                $updatable['department_office'] = $validated['department'];
            }
        }

        $passenger->update($updatable);

        // Update user email if provided and user exists
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
