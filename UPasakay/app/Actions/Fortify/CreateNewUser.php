<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
            'passenger_number' => ['required', 'string', 'unique:passengers,passenger_number'],
            'passenger_type' => ['nullable', 'string', 'in:student,staff,faculty'],
            'department' => ['nullable', 'string', 'max:255'],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password_hash' => $input['password'],
        ]);

        // Automatically create the passenger profile as "pending"
        Passenger::create([
            'user_id' => $user->id,
            'full_name' => $input['name'],
            'email' => $input['email'],
            'password_hash' => $input['password'],
            'passenger_number' => $input['passenger_number'],
            'department' => $input['department'] ?? null,
            'passenger_type' => $input['passenger_type'] ?? 'student',
            'passenger_status' => 'pending',
        ]);

        return $user;
    }
}