<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The required channels may be registered here
| and others may be registered in your service providers.
|
*/

// Public channels - anyone can listen
Broadcast::channel('shuttle-locations', function ($user) {
    return true;
});

Broadcast::channel('driver-requests', function ($user) {
    // Only allow authenticated users to listen to driver requests
    return $user !== null;
});

// Private channels - only authorized users
Broadcast::channel('passenger-{passengerId}', function ($user, $passengerId) {
    // Allow passenger to listen to their own channel
    // or allow admin/driver to monitor
    return (int) $user?->id === (int) $passengerId || $user?->role === 'admin';
});

Broadcast::channel('driver-{driverId}', function ($user, $driverId) {
    // Allow driver to listen to their own channel
    return (int) $user?->id === (int) $driverId || $user?->role === 'admin';
});

Broadcast::channel('shuttle-{shuttleId}', function ($user, $shuttleId) {
    // Allow all authenticated users to monitor shuttle status
    return $user !== null;
});
