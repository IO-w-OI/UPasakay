<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Driver;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('drivers')->delete();

        $drivers = [
            ['email' => 'juan@upasakay.com', 'full_name' => 'Juan dela Cruz', 'license' => 'N01-23-000001'],
            ['email' => 'maria@upasakay.com', 'full_name' => 'Maria Reyes', 'license' => 'N01-23-000002'],
            ['email' => 'pedro@upasakay.com', 'full_name' => 'Pedro Santos', 'license' => 'N01-23-000003'],
            ['email' => 'ana@upasakay.com', 'full_name' => 'Ana Gomez', 'license' => 'N01-23-000004'],
        ];

        foreach ($drivers as $d) {
            $user = User::firstOrCreate(
                ['email' => $d['email']],
                ['password_hash' => Hash::make('password')]
            );

            Driver::updateOrCreate(
                ['user_id' => $user->id],
                ['full_name' => $d['full_name'], 'license_number' => $d['license'], 'is_available' => true]
            );
        }
    }
}