<?php

namespace App\Providers;

use App\Listeners\LogSuccessfulLogin;
use App\Models\DriverAssignment;
use App\Models\PickupRequest;
use App\Observers\DriverAssignmentObserver;
use App\Observers\PickupRequestObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Register model observers for activity logging
        PickupRequest::observe(PickupRequestObserver::class);
        DriverAssignment::observe(DriverAssignmentObserver::class);

        // Register event listener for login activity
        Event::listen(Login::class, LogSuccessfulLogin::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
