<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePassengerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $passengerId = $this->route('passenger');

        return [
            'email' => "sometimes|email|unique:users,email,{$passengerId},id",
            'passenger_number' => "sometimes|string|unique:passengers,passenger_number,{$passengerId},user_id",
            'department' => 'nullable|string|max:255',
            'passenger_type' => 'sometimes|string|in:student,staff,faculty',
        ];
    }
}
