<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'admin@upasakay.edu.ph'],
            ['password_hash' => Hash::make('Admin@1234')]
        );

        Admin::updateOrCreate(
            ['user_id' => $user->id],
            ['access_level' => 1]
        );
    }
}
