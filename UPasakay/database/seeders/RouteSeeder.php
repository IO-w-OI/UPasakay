<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        Route::query()->delete();

        Route::insert([
            [
                'name' => 'North',
                'start_location' => 'UP Cebu',
                'end_location' => 'Consolacion',
                'distance_km' => 14.00,
                'estimated_duration_minutes' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'South',
                'start_location' => 'UP Cebu',
                'end_location' => 'Tabunok, Talisay',
                'distance_km' => 10.00,
                'estimated_duration_minutes' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cebu City',
                'start_location' => 'UP Cebu',
                'end_location' => 'Talamban',
                'distance_km' => 6.00,
                'estimated_duration_minutes' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}