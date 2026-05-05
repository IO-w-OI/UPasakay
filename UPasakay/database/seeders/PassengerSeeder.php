<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Passenger;

class PassengerSeeder extends Seeder
{
    public function run(): void
    {
        $seedPassengers = [
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan@up.edu.ph',
                'passenger_number' => '2021-12345',
                'department' => 'College of Science',
                'passenger_type' => 'student',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria@up.edu.ph',
                'passenger_number' => 'STAFF-001',
                'department' => 'Office of the Registrar',
                'passenger_type' => 'staff',
            ],
            [
                'name' => 'Student Three',
                'email' => 'student3@up.edu.ph',
                'passenger_number' => 'STU-003',
                'department' => 'College of Engineering',
                'passenger_type' => 'student',
            ],
            [
                'name' => 'Student Four',
                'email' => 'student4@up.edu.ph',
                'passenger_number' => 'STU-004',
                'department' => 'College of Arts and Letters',
                'passenger_type' => 'student',
            ],
        ];

        foreach ($seedPassengers as $seedPassenger) {
            $user = User::updateOrCreate(
                ['email' => $seedPassenger['email']],
                [
                    'name' => $seedPassenger['name'],
                    'password_hash' => 'password',
                ]
            );

            Passenger::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'passenger_number' => $seedPassenger['passenger_number'],
                    'department' => $seedPassenger['department'],
                    'passenger_type' => $seedPassenger['passenger_type'],
                    'passenger_status' => 'active',
                    'updated_at' => now(),
                ]
            );
        }
    }
}