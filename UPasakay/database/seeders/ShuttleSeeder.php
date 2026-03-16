<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Shuttle;

class ShuttleSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE shuttles RESTART IDENTITY CASCADE');

        $south = Route::where('name', 'South')->first();
        $north = Route::where('name', 'North')->first();
        $cebu = Route::where('name', 'Cebu City')->first();

        $juan = Driver::where('full_name', 'Juan dela Cruz')->first();
        $robert = Driver::where('full_name', 'Robert Reyes')->first();
        $pedro = Driver::where('full_name', 'Pedro Santos')->first();
        $greg = Driver::where('full_name', 'Greg Gomez')->first();

        Shuttle::insert([
            [
                'shuttle_code' => 'SH-001',
                'plate_number' => 'GBH-1234',
                'capacity' => 20,
                'is_active' => true,
                'status' => 'active',
                'route_id' => $south?->id,
                'driver_id' => $juan?->id,
                'last_seen_at' => now()->subMinutes(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shuttle_code' => 'SH-002',
                'plate_number' => 'KTR-5678',
                'capacity' => 20,
                'is_active' => true,
                'status' => 'active',
                'route_id' => $north?->id,
                'driver_id' => $robert?->id,
                'last_seen_at' => now()->subMinutes(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shuttle_code' => 'SH-003',
                'plate_number' => 'PLM-9101',
                'capacity' => 15,
                'is_active' => true,
                'status' => 'idle',
                'route_id' => $cebu?->id,
                'driver_id' => $pedro?->id,
                'last_seen_at' => now()->subMinutes(8),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shuttle_code' => 'SH-004',
                'plate_number' => 'ZXQ-1122',
                'capacity' => 15,
                'is_active' => false,
                'status' => 'offline',
                'route_id' => $south?->id,
                'driver_id' => $greg?->id,
                'last_seen_at' => now()->subHours(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}