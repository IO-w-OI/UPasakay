<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            RouteSeeder::class,
            StopSeeder::class,
            DriverSeeder::class,
            ShuttleSeeder::class,
            PassengerSeeder::class,
            PickupRequestSeeder::class,
        ]);
        echo "Seeder is running!\n";
    }
}
