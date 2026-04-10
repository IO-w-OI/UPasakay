<?php

use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\StopController;
use App\Http\Controllers\Api\ShuttleController;
use App\Http\Controllers\Api\PassengerController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\PickupRequestController;
use App\Http\Controllers\Api\DriverAssignmentController;
use App\Http\Controllers\Api\ShuttleLocationController;

/*
|--------------------------------------------------------------------------
| Public Routes (no authentication required)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Mobile App Routes
|--------------------------------------------------------------------------
| Dedicated endpoints for the Expo/React Native mobile app.
| Uses token-based auth via Laravel Sanctum.
|--------------------------------------------------------------------------
*/
Route::prefix('mobile')->group(function () {
    // Public: Mobile login — authenticates a Passenger and returns a Sanctum token
    Route::post('/login', function (Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $passenger = Passenger::where('email', $request->email)->first();

        if (! $passenger || ! Hash::check($request->password, $passenger->password_hash)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        // Revoke any existing mobile tokens before creating a new one
        $passenger->tokens()->where('name', 'mobile-app')->delete();

        $token = $passenger->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $passenger->id,
                'full_name' => $passenger->full_name,
                'email' => $passenger->email,
                'passenger_number' => $passenger->passenger_number,
                'passenger_type' => $passenger->passenger_type,
                'passenger_status' => $passenger->passenger_status,
            ],
        ]);
    });

    // Public: Mobile registration — creates User + Passenger (pending) and returns a token
    Route::post('/register', function (Request $request) {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:passengers,email',
            'password' => 'required|min:8|confirmed',
            'passenger_number' => 'required|string|unique:passengers,passenger_number',
            'passenger_type' => 'nullable|string|in:student,staff,faculty',
            'department' => 'nullable|string|max:255',
        ]);

        // Create a User record (for cross-platform compatibility)
        $user = User::create([
            'name' => $validated['full_name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
        ]);

        // Create Passenger profile as "pending" — needs admin approval
        $passenger = Passenger::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'passenger_number' => $validated['passenger_number'],
            'department' => $validated['department'] ?? null,
            'passenger_type' => $validated['passenger_type'] ?? 'student',
            'passenger_status' => 'pending',
        ]);

        // Issue a Sanctum token so the user can log in (but middleware blocks actions)
        $token = $passenger->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Your account is pending admin approval.',
            'token' => $token,
            'user' => [
                'id' => $passenger->id,
                'full_name' => $passenger->full_name,
                'email' => $passenger->email,
                'passenger_number' => $passenger->passenger_number,
                'passenger_type' => $passenger->passenger_type,
                'passenger_status' => $passenger->passenger_status,
            ],
        ], 201);
    });

    // Protected: Get current authenticated passenger's profile
    Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
        $passenger = $request->user();

        return response()->json([
            'user' => [
                'id' => $passenger->id,
                'full_name' => $passenger->full_name,
                'email' => $passenger->email,
                'passenger_number' => $passenger->passenger_number,
                'passenger_type' => $passenger->passenger_type,
                'passenger_status' => $passenger->passenger_status,
            ],
        ]);
    });

    // Protected + Approved: Routes that require admin approval
    Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsurePassengerIsApproved::class])->group(function () {
        Route::post('/pickup-requests', [PickupRequestController::class, 'store']);
    });
});

/*
|--------------------------------------------------------------------------
| Protected Routes (require valid Sanctum token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Resources
    Route::apiResource('routes', RouteController::class);
    Route::apiResource('stops', StopController::class);
    Route::apiResource('shuttles', ShuttleController::class);
    Route::apiResource('passengers', PassengerController::class);
    Route::apiResource('drivers', DriverController::class);
    Route::apiResource('pickup-requests', PickupRequestController::class);
    Route::apiResource('driver-assignments', DriverAssignmentController::class);
    Route::apiResource('shuttle-locations', ShuttleLocationController::class);
});