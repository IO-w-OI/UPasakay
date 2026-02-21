<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        Route::insert([
            [
                'name' => 'Route A - UP to JY Square',
                'start_location' => 'UP Gate',
                'end_location' => 'JY Square',
                'distance_km' => 5.20,
                'estimated_duration_minutes' => 20,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Route B - UP to USPF',
                'start_location' => 'UP Gate',
                'end_location' => 'USPF',
                'distance_km' => 3.80,
                'estimated_duration_minutes' => 15,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}