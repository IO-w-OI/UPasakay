<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shuttle;

class ShuttleSeeder extends Seeder
{
    public function run(): void
    {
        Shuttle::insert([
            [
                'plate_number' => 'ABC-1234',
                'capacity' => 20,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'plate_number' => 'XYZ-5678',
                'capacity' => 15,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}