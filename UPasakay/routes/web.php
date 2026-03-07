<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LiveMapController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PickupRequestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('live-map',  [LiveMapController::class,   'index'])->name('live-map');

    // Drivers
    Route::get('drivers',           [DriverController::class, 'index'])->name('drivers.index');
    Route::get('drivers/{driver}',  [DriverController::class, 'show'])->name('drivers.show');
    Route::post('drivers',          [DriverController::class, 'store'])->name('drivers.store');
    Route::patch('drivers/{driver}',[DriverController::class, 'update'])->name('drivers.update');
    Route::delete('drivers/{driver}',[DriverController::class,'destroy'])->name('drivers.destroy');

    // Pickup Requests
    Route::get('pickup-requests', [PickupRequestController::class, 'index'])->name('pickup-requests.index');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // Feedback
    Route::get('feedback', [FeedbackController::class, 'index'])->name('feedback.index');
});

require __DIR__ . '/settings.php';
