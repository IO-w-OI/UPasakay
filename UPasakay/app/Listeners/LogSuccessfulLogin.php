<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Events\Login;

class LogSuccessfulLogin
{
    /**
     * Handle the Login event.
     */
    public function handle(Login $event): void
    {
        /** @var User $user */
        $user = $event->user;

        ActivityLog::log(
            type: 'login',
            description: "{$user->email} logged in",
            actor: $user,
        );
    }
}
