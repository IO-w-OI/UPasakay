<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceTokenController;
use App\Http\Controllers\Api\DriverApiController;
use App\Http\Controllers\Api\DriverAssignmentController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PassengerController;
use App\Http\Controllers\Api\PassengerProfileController;
use App\Http\Controllers\Api\PickupRequestController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\ShuttleController;
use App\Http\Controllers\Api\ShuttleLocationController;
use App\Http\Controllers\Api\StopController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;

// Heroku keepalive / health (no DB) — use with cron-job.org every ~10 minutes
Route::get('ping', fn () => response()->json([
    'status' => 'ok',
    'time' => now()->toIso8601String(),
]));

// Public auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/google', [AuthController::class, 'googleAuth']);
Route::post('admin/register', [AdminAuthController::class, 'register']);
Route::post('password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('password/reset', [AuthController::class, 'resetPassword']);

// Backward-compatible mobile alias routes
Route::prefix('mobile')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('password/reset', [AuthController::class, 'resetPassword']);
});

// Notification routes are kept outside auth middleware to preserve existing API behavior
Route::get('notifications/stats', [NotificationController::class, 'stats'])->name('notifications.stats');
Route::get('notifications/scheduled', [NotificationController::class, 'scheduled'])->name('notifications.scheduled');
Route::post('notifications/process-scheduled', [NotificationController::class, 'processScheduledNotifications'])->name('notifications.process-scheduled');
Route::apiResource('notifications', NotificationController::class);
Route::post('notifications/{notification}/send', [NotificationController::class, 'send'])->name('notifications.send');
Route::post('notifications/{notification}/schedule', [NotificationController::class, 'schedule'])->name('notifications.schedule');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('revoke-all-tokens', [AuthController::class, 'revokeAllTokens']);

    // Expo push device token registration
    Route::post('device-tokens', [DeviceTokenController::class, 'store']);
    Route::delete('device-tokens', [DeviceTokenController::class, 'destroy']);

    // Unified passenger profile endpoints (shared by web and mobile)
    Route::get('passenger/profile', [PassengerProfileController::class, 'show']);
    Route::patch('passenger/profile', [PassengerProfileController::class, 'update']);
    Route::post('passenger/profile/complete', [PassengerProfileController::class, 'complete']);
    Route::get('passenger/profile/verification', [PassengerProfileController::class, 'verification']);
    Route::get('passenger/notifications', [PassengerProfileController::class, 'notifications']);

    // Backward-compatible mobile profile aliases
    Route::prefix('mobile')->group(function () {
        Route::get('me', [PassengerProfileController::class, 'show']);
        Route::patch('profile', [PassengerProfileController::class, 'update']);
        Route::post('profile/complete', [PassengerProfileController::class, 'complete']);
        Route::get('verification', [PassengerProfileController::class, 'verification']);
    });

    Route::get('routes/{route}/shuttles', [RouteController::class, 'shuttles']);
    Route::apiResource('routes', RouteController::class);
    Route::apiResource('stops', StopController::class);
    Route::apiResource('shuttles', ShuttleController::class);
    Route::apiResource('passengers', PassengerController::class);
    Route::apiResource('drivers', DriverController::class);
    Route::apiResource('pickup-requests', PickupRequestController::class)
        ->middleware('ensure.passenger.approved');
    // Passenger self-confirms boarding by scanning/typing the code on the
    // shuttle (verified against the assigned shuttle + a GPS proximity check).
    Route::post('pickup-requests/{pickupRequest}/confirm-boarding', [PickupRequestController::class, 'confirmBoarding'])
        ->middleware('ensure.passenger.approved');
    // Passenger rates a completed ride (1–5 + optional comment).
    Route::post('pickup-requests/{pickupRequest}/feedback', [PickupRequestController::class, 'feedback'])
        ->middleware('ensure.passenger.approved');
    Route::apiResource('driver-assignments', DriverAssignmentController::class);
    Route::apiResource('shuttle-locations', ShuttleLocationController::class);
    Route::post('driver/location', [ShuttleLocationController::class, 'storeFromDriver']);

    // Driver app: read-only trip feed + notifications, plus the only
    // mutating actions allowed (at the point of boarding at a stop).
    Route::patch('driver/status', [DriverApiController::class, 'setStatus']);
    Route::get('driver/queue', [DriverApiController::class, 'queue']);
    Route::get('driver/notifications', [DriverApiController::class, 'notifications']);
    Route::patch('pickup-requests/{pickupRequest}/board', [DriverApiController::class, 'board']);
    Route::patch('pickup-requests/{pickupRequest}/no-show', [DriverApiController::class, 'noShow']);
    Route::patch('pickup-requests/{pickupRequest}/decline', [DriverApiController::class, 'decline']);

    //Edit Profile for both drivers and passengers (shared endpoint)
    Route::get('profile', [ProfileController::class, 'show']);
    Route::patch('profile', [ProfileController::class, 'update']);
});
