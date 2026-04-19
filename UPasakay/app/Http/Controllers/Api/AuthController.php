<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $passwordRules = ['required', 'confirmed'];

        if (!$request->filled('passenger_number')) {
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
            'passenger_type' => ['nullable', 'string', Rule::in(Passenger::PASSENGER_TYPES)],
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
            'verification_status' => 'pending',
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        $payload = $this->buildAuthPayload($user, $passenger, $token);

        return response()->json([
            'success' => true,
            'message' => 'Passenger account created successfully',
            'data' => $payload,
            'passenger' => $payload['passenger'],
            'onboarding' => $payload['onboarding'],
            'token' => $payload['token'],
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
            if (!Hash::check($request->password, (string) $passenger->password_hash)) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $passenger->tokens()->delete();
            $token = $passenger->createToken('api-token')->plainTextToken;

            $linkedUser = $passenger->user;
            $payload = $this->buildAuthPayload($linkedUser ?? $passenger, $passenger, $token);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => $payload,
                'passenger' => $payload['passenger'],
                'onboarding' => $payload['onboarding'],
                'token' => $payload['token'],
            ], 200);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, (string) $user->password_hash)) {
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
        $payload = $this->buildAuthPayload($user, $user->passenger, $token);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => $payload,
            'passenger' => $payload['passenger'],
            'onboarding' => $payload['onboarding'],
            'token' => $payload['token'],
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

    private function buildAuthPayload(Model $authUser, ?Passenger $passenger, string $token): array
    {
        return [
            'user' => [
                'id' => $authUser->getKey(),
                'email' => $authUser->email,
            ],
            'passenger' => $this->formatPassenger($passenger),
            'onboarding' => [
                'required' => !$passenger?->profile_completed,
                'profile_completed' => (bool) ($passenger?->profile_completed ?? false),
                'next_route' => !$passenger?->profile_completed
                    ? 'ProfileOnboarding'
                    : $this->routeForPassengerType($passenger?->passenger_type),
            ],
            'token' => $token,
        ];
    }

    private function formatPassenger(?Passenger $passenger): ?array
    {
        if (!$passenger) {
            return null;
        }

        return [
            'id' => $passenger->id,
            'user_id' => $passenger->user_id,
            'full_name' => $passenger->full_name,
            'email' => $passenger->email,
            'phone_number' => $passenger->phone_number,
            'passenger_number' => $passenger->passenger_number,
            'passenger_type' => $passenger->passenger_type,
            'department_office' => $passenger->department_office,
            'student_id' => $passenger->student_id,
            'employee_id' => $passenger->employee_id,
            'verification_status' => $passenger->verification_status,
            'passenger_status' => $passenger->passenger_status,
            'profile_completed' => (bool) $passenger->profile_completed,
            'proof_document_path' => $passenger->proof_document_path,
            'reviewed_at' => $passenger->reviewed_at,
        ];
    }

    private function routeForPassengerType(?string $passengerType): string
    {
        return match ($passengerType) {
            'student' => 'UserHome',
            'faculty' => 'UserRecents',
            'employee' => 'UserMap',
            default => 'UserProfile',
        };
    }
}
