<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

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
            'passenger_type' => ['nullable', 'string', Rule::in(Passenger::PASSENGER_TYPES)],
            'department_office' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
        ]);

        // 1. Create User - Using raw $request fallbacks for the name
        $user = User::create([
            'name' => $request->full_name ?? $request->name ?? 'New User',
            'email' => $validated['email'],
            'password_hash' => $validated['password'],
        ]);

        // 2. Create Passenger - Using raw $request fallbacks for Dept and Phone
        $passenger = Passenger::create([
            'user_id' => $user->id,
            'full_name' => $request->full_name ?? $request->name ?? 'New User',
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'passenger_number' => $validated['passenger_number'] ?? $this->generatePassengerNumber(),
            'passenger_type' => $validated['passenger_type'] ?? 'student',
            'department_office' => $request->department_office ?? $request->department,
            'department' => $request->department_office ?? $request->department,
            'phone_number' => $request->phone ?? $request->phone_number,
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
            if (! Hash::check($request->password, (string) $passenger->password_hash)) {
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
        if (! $user || ! Hash::check($request->password, (string) $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
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
            $passengerNumber = 'PASS'.strtoupper(uniqid());
        } while (Passenger::where('passenger_number', $passengerNumber)->exists());

        return $passengerNumber;
    }

    private function buildAuthPayload(Model $authUser, ?Passenger $passenger, string $token): array
    {
        // We call this first to get the cleaned data
        $formattedPassenger = $this->formatPassenger($passenger);

        return [
            'user' => [
                'id' => $authUser->getKey(),
                'email' => $authUser->email,
                'full_name' => $formattedPassenger['full_name'] ?? $authUser->name,
                'name' => $formattedPassenger['full_name'] ?? $authUser->name,
                
                // THIS LINE IS MISSING: This is why the Profile screen is blank
                'department_office' => $formattedPassenger['department_office'] ?? null,
                'department' => $formattedPassenger['department_office'] ?? null,
            ],
            'passenger' => $formattedPassenger,
            'onboarding' => [
                'required' => !($passenger?->profile_completed ?? false),
                'profile_completed' => (bool) ($passenger?->profile_completed ?? false),
                'next_route' => $this->routeForPassengerType($passenger?->passenger_type),
            ],
            'token' => $token,
        ];
    }

    private function formatPassenger(?Passenger $passenger): ?array
    {
        if (! $passenger) return null;

        return [
            'id' => $passenger->id,
            'user_id' => $passenger->user_id,
            'full_name' => $passenger->full_name,
            'name' => $passenger->full_name,
            'email' => $passenger->email,
            'phone_number' => $passenger->phone_number,
            'passenger_number' => $passenger->passenger_number,
            'passenger_type' => $passenger->passenger_type,
            'department_office' => $passenger->department_office,
            'department' => $passenger->department_office,
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
            'student'  => 'UserHome',
            'employee' => 'UserHome', // Change this to the actual screen name for Employees/Drivers
            'faculty'  => 'UserHome',
            default    => 'UserHome',
        };
    }
}
