<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stop;

class StopSeeder extends Seeder
{
    public function run(): void
    {
        Stop::insert([
            [
                'route_id' => 1,
                'name' => 'UP Gate',
                'latitude' => 10.7202,
                'longitude' => 122.5621,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'route_id' => 1,
                'name' => 'Corner Sudlon',
                'latitude' => 10.7150,
                'longitude' => 122.5700,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'route_id' => 1,
                'name' => 'JY Square',
                'latitude' => 10.7037,
                'longitude' => 122.5620,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'route_id' => 2,
                'name' => 'Cabancalan',
                'latitude' => 10.7202,
                'longitude' => 122.5621,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'route_id' => 2,
                'name' => 'USPF',
                'latitude' => 10.7299,
                'longitude' => 122.5512,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}