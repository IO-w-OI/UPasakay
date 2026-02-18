<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PickupRequest;

class PickupRequestSeeder extends Seeder
{
    public function run(): void
    {
        PickupRequest::insert([
            [
                'user_id' => 1,
                'route_id' => 1,
                'pickup_stop_id' => 1,
                'dropoff_stop_id' => 3,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'route_id' => 2,
                'pickup_stop_id' => 4,
                'dropoff_stop_id' => 5,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}