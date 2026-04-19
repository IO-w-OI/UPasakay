<?php

namespace App\Http\Requests;

use App\Models\Passenger;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePassengerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // If the request comes from an authenticated user (admin), require email/password
        $emailRule = $this->user() ? 'required|email|unique:users,email' : 'nullable|email|unique:users,email';
        $passwordRule = $this->user() ? 'required|string|min:8' : 'nullable|string|min:8';

        return [
            'full_name' => 'nullable|string|max:255',
            'email' => $emailRule,
            'password' => $passwordRule,
            'passenger_number' => 'required|string|unique:passengers,passenger_number',
            'department_office' => ['nullable', 'string', 'max:255', Rule::in(Passenger::DEPARTMENT_OFFICES)],
            'department' => 'nullable|string|max:255',
            'passenger_type' => ['nullable', 'string', Rule::in(Passenger::PASSENGER_TYPES)],
            'student_id' => 'nullable|string',
            'employee_id' => 'nullable|string',
            'phone_number' => 'nullable|string|max:32',
            'proof_document_path' => 'nullable|string',
        ];
    }
}
