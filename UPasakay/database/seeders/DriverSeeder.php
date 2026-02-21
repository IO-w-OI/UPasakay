<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Support\Facades\Hash;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'email' => 'pedro@upasakay.com',
            'password_hash' => Hash::make('password'),
        ]);

        Driver::create([
            'user_id' => $user->id,
            'license_number' => 'N01-23-456789',
            'is_available' => true,
        ]);
    }
}