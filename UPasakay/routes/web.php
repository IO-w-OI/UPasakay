<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LiveMapController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PassengerApprovalController;
use App\Http\Controllers\PickupRequestController;
use App\Http\Controllers\ShuttleWebController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('live-map', [LiveMapController::class, 'index'])->name('live-map');

    // Admins
    Route::resource('admins', AdminController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Drivers
    Route::get('drivers', [DriverController::class, 'index'])->name('drivers.index');
    Route::get('drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
    Route::post('drivers', [DriverController::class, 'store'])->name('drivers.store');
    Route::patch('drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update');
    Route::patch('drivers/{driver}/reset-password', [DriverController::class, 'resetPassword'])->name('drivers.reset-password');
    Route::delete('drivers/{driver}', [DriverController::class, 'destroy'])->name('drivers.destroy');

    // Shuttles
    Route::patch('shuttles/{shuttle}', [ShuttleWebController::class, 'update'])->name('shuttles.update');
    Route::patch('shuttles/{shuttle}/assign-driver', [ShuttleWebController::class, 'assignDriver'])->name('shuttles.assign-driver');
    Route::patch('shuttles/{shuttle}/status', [ShuttleWebController::class, 'updateStatus'])->name('shuttles.update-status');

    // Pickup Requests
    Route::get('pickup-requests', [PickupRequestController::class, 'index'])->name('pickup-requests.index');
    Route::patch('pickup-requests/{pickupRequest}/assign', [PickupRequestController::class, 'assign'])->name('pickup-requests.assign');

    // Passenger approvals
    Route::get('passengers', [PassengerApprovalController::class, 'index'])->name('passengers.index');
    Route::patch('passengers/{passenger}/status', [PassengerApprovalController::class, 'updateStatus'])->name('passengers.update-status');
    Route::patch('passengers/bulk-status', [PassengerApprovalController::class, 'bulkUpdateStatus'])->name('passengers.bulk-status');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications', [NotificationController::class, 'store'])->name('notifications.store');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('notifications/schedules', [NotificationController::class, 'storeSchedule'])->name('notifications.schedules.store');
    Route::patch('notifications/schedules/{id}', [NotificationController::class, 'updateSchedule'])->name('notifications.schedules.update');
    Route::patch('notifications/schedules/{id}/toggle', [NotificationController::class, 'toggleSchedule'])->name('notifications.schedules.toggle');
    Route::delete('notifications/schedules/{id}', [NotificationController::class, 'destroySchedule'])->name('notifications.schedules.destroy');

    // Feedback
    Route::get('feedback', [FeedbackController::class, 'index'])->name('feedback.index');
});

require __DIR__.'/settings.php';
