<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Driver;
use App\Models\Passenger;
use App\Models\Route;
use App\Models\Shuttle;
use App\Models\ShuttleLocation;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Stable demo accounts for Expo / Heroku (not registered in DatabaseSeeder).
 *
 * Run: php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    private const DEMO_PASSWORD = 'password123';

    public function run(): void
    {
        $route = Route::query()->where('is_active', true)->first();
        if ($route === null) {
            $route = Route::create([
                'name' => 'Demo Route',
                'start_location' => 'UP Cebu',
                'end_location' => 'Demo',
                'distance_km' => 5.0,
                'estimated_duration_minutes' => 20,
                'is_active' => true,
            ]);
        }

        $adminUser = User::query()->updateOrCreate(
            ['email' => 'demo.admin@upasakay.com'],
            [
                'name' => 'Demo Admin',
                'password_hash' => self::DEMO_PASSWORD,
                'email_verified_at' => now(),
            ],
        );

        Admin::query()->updateOrCreate(
            ['user_id' => $adminUser->id],
            ['access_level' => 1],
        );

        $driverUser = User::query()->updateOrCreate(
            ['email' => 'demo.driver@upasakay.com'],
            [
                'name' => 'Demo Driver',
                'password_hash' => self::DEMO_PASSWORD,
                'email_verified_at' => now(),
            ],
        );

        $driver = Driver::query()->updateOrCreate(
            ['user_id' => $driverUser->id],
            [
                'full_name' => 'Demo Driver',
                'license_number' => 'DEMO-LIC-1',
                'is_available' => true,
                'driver_status' => 'active',
            ],
        );

        $shuttle = Shuttle::query()->updateOrCreate(
            ['shuttle_code' => 'DEMO-1'],
            [
                'plate_number' => 'DEMO-PLT-001',
                'capacity' => 12,
                'shuttle_type' => 'van',
                'is_active' => true,
                'status' => 'active',
                'route_id' => $route->id,
                'driver_id' => $driver->id,
                'last_seen_at' => now(),
            ],
        );

        ShuttleLocation::query()->where('shuttle_id', $shuttle->id)->delete();
        ShuttleLocation::query()->create([
            'shuttle_id' => $shuttle->id,
            'latitude' => 10.3157,
            'longitude' => 123.8854,
            'speed_kmh' => 0,
        ]);

        $passengerUser = User::query()->updateOrCreate(
            ['email' => 'demo.passenger@upasakay.com'],
            [
                'name' => 'Demo Passenger',
                'password_hash' => self::DEMO_PASSWORD,
                'email_verified_at' => now(),
            ],
        );

        Passenger::query()->updateOrCreate(
            ['user_id' => $passengerUser->id],
            [
                'full_name' => 'Demo Passenger',
                'email' => 'demo.passenger@upasakay.com',
                'password_hash' => self::DEMO_PASSWORD,
                'passenger_number' => 'DEMO-PAX-001',
                'department' => 'Demo',
                'passenger_type' => 'other',
                'passenger_status' => 'active',
                'verification_status' => 'approved',
            ],
        );

        if ($this->command) {
            $this->command->info('Demo accounts ready (password: '.self::DEMO_PASSWORD.')');
            $this->command->info('  Admin:     demo.admin@upasakay.com');
            $this->command->info('  Driver:    demo.driver@upasakay.com  (shuttle DEMO-1)');
            $this->command->info('  Passenger: demo.passenger@upasakay.com');
        }
    }
}
