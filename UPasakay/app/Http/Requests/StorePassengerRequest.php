<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePassengerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'passenger_number' => 'required|string|unique:passengers,passenger_number',
            'department' => 'nullable|string|max:255',
            'passenger_type' => 'nullable|string|in:student,staff,faculty',
        ];
    }
}
