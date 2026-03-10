<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RouteSeeder::class,
            StopSeeder::class,
            ShuttleSeeder::class,
            PassengerSeeder::class,
            DriverSeeder::class,
            PickupRequestSeeder::class,
        ]);
    }
}