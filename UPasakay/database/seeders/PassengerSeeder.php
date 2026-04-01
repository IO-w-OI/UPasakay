<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Passenger;
use Illuminate\Support\Facades\Hash;

class PassengerSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = User::updateOrCreate(
            ['email' => 'juan@up.edu.ph'],
            ['password_hash' => Hash::make('password')]
        );

        $user2 = User::updateOrCreate(
            ['email' => 'maria@up.edu.ph'],
            ['password_hash' => Hash::make('password')]
        );

        Passenger::updateOrCreate(
            ['user_id' => $user1->id],
            [
                'passenger_number' => '2021-12345',
                'department' => 'College of Science',
                'passenger_type' => 'student',
                'updated_at' => now(),
            ]
        );

        Passenger::updateOrCreate(
            ['user_id' => $user2->id],
            [
                'passenger_number' => 'STAFF-001',
                'department' => 'Office of the Registrar',
                'passenger_type' => 'staff',
                'updated_at' => now(),
            ]
        );
    }
}