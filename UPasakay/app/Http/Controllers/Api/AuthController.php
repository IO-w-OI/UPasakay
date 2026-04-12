<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $passwordRules = ['required', 'confirmed'];

        if (! $request->filled('passenger_number')) {
            $passwordRules[] = Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols();
        }

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email'),
                Rule::unique('passengers', 'email'),
            ],
            'password' => $passwordRules,
            'full_name' => ['nullable', 'string', 'max:255'],
            'passenger_number' => ['nullable', 'string', 'unique:passengers,passenger_number'],
            'passenger_type' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $validated['full_name'] ?? null,
            'email' => $validated['email'],
            'password_hash' => $validated['password'],
        ]);

        $passenger = Passenger::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'] ?? null,
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'passenger_number' => $validated['passenger_number'] ?? $this->generatePassengerNumber(),
            'passenger_type' => $validated['passenger_type'] ?? 'student',
            'passenger_status' => 'active',
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Passenger account created successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ],
                'token' => $token,
            ],
            'passenger' => [
                'id' => $passenger->id,
                'email' => $passenger->email,
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $passenger = Passenger::where('email', $request->email)->first();
        if ($passenger) {
            if (! Hash::check($request->password, (string) $passenger->password_hash)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $passenger->tokens()->delete();
            $token = $passenger->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $passenger->id,
                        'email' => $passenger->email,
                    ],
                    'token' => $token,
                ],
                'passenger' => [
                    'id' => $passenger->id,
                    'email' => $passenger->email,
                ],
                'token' => $token,
            ], 200);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, (string) $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'errors' => [
                    'email' => ['The provided credentials are invalid.'],
                ],
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ],
                'token' => $token,
            ],
            'passenger' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $authUser?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => $authUser instanceof Passenger ? 'Logged out successfully.' : 'Logout successful',
        ], 200);
    }

    public function revokeAllTokens(Request $request): JsonResponse
    {
        $request->user()?->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'All tokens revoked successfully',
        ], 200);
    }

    private function generatePassengerNumber(): string
    {
        do {
            $passengerNumber = 'PASS' . strtoupper(uniqid());
        } while (Passenger::where('passenger_number', $passengerNumber)->exists());

        return $passengerNumber;
    }
}
