<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\Passenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new passenger account
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            // Create the user
            $user = User::create([
                'email' => $request->email,
                'password_hash' => $request->password,
            ]);

            // Create passenger profile
            Passenger::create([
                'user_id' => $user->id,
                'passenger_number' => $this->generatePassengerNumber(),
            ]);

            // Generate API token
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
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login passenger with email and password
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password_hash)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are invalid.'],
                ]);
            }

            // Revoke all existing tokens for fresh login
            $user->tokens()->delete();

            // Generate new API token
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
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'errors' => $e->errors(),
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke all tokens for the current user
     */
    public function revokeAllTokens(Request $request): JsonResponse
    {
        try {
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'All tokens revoked successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token revocation failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a unique passenger number
     */
    private function generatePassengerNumber(): string
    {
        do {
            $passengerNumber = 'PASS' . strtoupper(uniqid());
        } while (Passenger::where('passenger_number', $passengerNumber)->exists());

        return $passengerNumber;
     * Register a new user and return an API token.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:passengers,email',
            'password' => 'required|string|min:8|confirmed',
            'passenger_number' => 'required|string|unique:passengers,passenger_number',
        ]);

        $passenger = Passenger::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'passenger_number' => $validated['passenger_number'],
            'passenger_type' => $request->input('passenger_type', 'student'),
            'passenger_status' => 'active',
        ]);

        $token = $passenger->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'passenger' => [
                'id' => $passenger->id,
                'email' => $passenger->email,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate a user and return an API token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        $passenger = Passenger::where('email', $request->email)->first();

        if (!$passenger || !Hash::check($request->password, $passenger->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $passenger->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'passenger' => [
                'id' => $passenger->id,
                'email' => $passenger->email,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Revoke the current user's token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
