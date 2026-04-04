<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\StopController;
use App\Http\Controllers\Api\ShuttleController;
use App\Http\Controllers\Api\PassengerController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\PickupRequestController;
use App\Http\Controllers\Api\DriverAssignmentController;
use App\Http\Controllers\Api\ShuttleLocationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;

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