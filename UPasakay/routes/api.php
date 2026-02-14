<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RideController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your mobile app or other API consumers.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes (no auth required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (requires auth)
Route::middleware('auth:sanctum')->group(function () {

    // User endpoints
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user', [UserController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rides / trips endpoints
    Route::get('/rides', [RideController::class, 'index']);      // List rides
    Route::get('/rides/{id}', [RideController::class, 'show']);  // Ride details
    Route::post('/rides', [RideController::class, 'store']);     // Create ride
    Route::put('/rides/{id}', [RideController::class, 'update']); // Update ride
    Route::delete('/rides/{id}', [RideController::class, 'destroy']); // Delete ride

    // Proximity notifications (RabbitMQ jobs)
    Route::post('/notify-proximity', [RideController::class, 'notifyProximity']);
});
