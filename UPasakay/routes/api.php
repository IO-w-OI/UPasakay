<?php

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