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
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ActiveShuttleController;
use App\Http\Controllers\Api\DriverLocationController;
use App\Http\Controllers\Api\DriverTripController;

// Public auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('revoke-all-tokens', [AuthController::class, 'revokeAllTokens']);
});

Route::apiResource('routes', RouteController::class);
Route::apiResource('stops', StopController::class);
Route::apiResource('shuttles', ShuttleController::class);
Route::apiResource('passengers', PassengerController::class);
Route::apiResource('drivers', DriverController::class);
Route::apiResource('pickup-requests', PickupRequestController::class);
Route::apiResource('driver-assignments', DriverAssignmentController::class);
Route::apiResource('shuttle-locations', ShuttleLocationController::class);

// Notification routes - specific routes must come before apiResource
Route::get('notifications/stats', [NotificationController::class, 'stats'])->name('notifications.stats');
Route::get('notifications/scheduled', [NotificationController::class, 'scheduled'])->name('notifications.scheduled');
Route::post('notifications/process-scheduled', [NotificationController::class, 'processScheduledNotifications'])->name('notifications.process-scheduled');
Route::apiResource('notifications', NotificationController::class);
Route::post('notifications/{notification}/send', [NotificationController::class, 'send'])->name('notifications.send');
Route::post('notifications/{notification}/schedule', [NotificationController::class, 'schedule'])->name('notifications.schedule');
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

        if (!$passenger || !Hash::check($request->password, $passenger->password_hash)) {
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

    // Driver routes — these can be used by driver accounts
    Route::middleware('auth:sanctum')->prefix('driver')->group(function () {
        // Location tracking endpoints
        Route::post('/location/update', [DriverLocationController::class, 'updateLocation']);
        Route::get('/location/latest', [DriverLocationController::class, 'getLatestLocation']);
        Route::post('/location/batch', [DriverLocationController::class, 'batchUpdateLocations']);

        // Trip status endpoints
        Route::post('/trip/start', [DriverTripController::class, 'startTrip']);
        Route::post('/trip/status', [DriverTripController::class, 'updateTripStatus']);
        Route::get('/trip/current', [DriverTripController::class, 'getCurrentTrip']);
        Route::post('/trip/end', [DriverTripController::class, 'endTrip']);
    });

    // Active shuttle information — available to both drivers and passengers
    Route::middleware('auth:sanctum')->prefix('shuttle')->group(function () {
        Route::get('/active', [ActiveShuttleController::class, 'getActiveShuttle']);
        Route::get('/active/all', [ActiveShuttleController::class, 'getAllActiveShuttles']);
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

/*
|--------------------------------------------------------------------------
| Public Trip Status Routes (no authentication required)
|--------------------------------------------------------------------------
| Allows passengers to view real-time trip status without authentication
|--------------------------------------------------------------------------
*/
Route::get('trip/{tripId}/status', [DriverTripController::class, 'getTripStatus']);
