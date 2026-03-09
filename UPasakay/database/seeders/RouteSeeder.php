<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Route;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE routes RESTART IDENTITY CASCADE');

        Route::insert([
            [
                'name' => 'South',
                'start_location' => 'UP Gate',
                'end_location' => 'SM Cebu',
                'distance_km' => 6.50,
                'estimated_duration_minutes' => 25,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'North',
                'start_location' => 'UP Gate',
                'end_location' => 'Ayala Center',
                'distance_km' => 4.20,
                'estimated_duration_minutes' => 18,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Cebu City',
                'start_location' => 'UP Gate',
                'end_location' => 'Colon Street',
                'distance_km' => 8.00,
                'estimated_duration_minutes' => 35,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}