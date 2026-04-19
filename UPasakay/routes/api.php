<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\StopController;
use App\Http\Controllers\Api\ShuttleController;
use App\Http\Controllers\Api\PassengerController;
use App\Http\Controllers\Api\PassengerProfileController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\PickupRequestController;
use App\Http\Controllers\Api\DriverAssignmentController;
use App\Http\Controllers\Api\ShuttleLocationController;
use App\Http\Controllers\Api\NotificationController;

// Public auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Backward-compatible mobile alias routes
Route::prefix('mobile')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
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

    // Unified passenger profile endpoints (shared by web and mobile)
    Route::get('passenger/profile', [PassengerProfileController::class, 'show']);
    Route::patch('passenger/profile', [PassengerProfileController::class, 'update']);
    Route::post('passenger/profile/complete', [PassengerProfileController::class, 'complete']);
    Route::get('passenger/profile/verification', [PassengerProfileController::class, 'verification']);

    // Backward-compatible mobile profile aliases
    Route::prefix('mobile')->group(function () {
        Route::get('me', [PassengerProfileController::class, 'show']);
        Route::patch('profile', [PassengerProfileController::class, 'update']);
        Route::post('profile/complete', [PassengerProfileController::class, 'complete']);
        Route::get('verification', [PassengerProfileController::class, 'verification']);
    });

    Route::apiResource('routes', RouteController::class);
    Route::apiResource('stops', StopController::class);
    Route::apiResource('shuttles', ShuttleController::class);
    Route::apiResource('passengers', PassengerController::class);
    Route::apiResource('drivers', DriverController::class);
    Route::apiResource('pickup-requests', PickupRequestController::class);
    Route::apiResource('driver-assignments', DriverAssignmentController::class);
    Route::apiResource('shuttle-locations', ShuttleLocationController::class);
});
