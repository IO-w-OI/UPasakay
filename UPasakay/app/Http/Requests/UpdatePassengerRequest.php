<?php

namespace App\Http\Requests;

use App\Models\Passenger;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'full_name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$passengerId},id",
            'passenger_number' => "sometimes|string|unique:passengers,passenger_number,{$passengerId},id",
            'department_office' => ['nullable', 'string', 'max:255', Rule::in(Passenger::DEPARTMENT_OFFICES)],
            'department' => 'nullable|string|max:255',
            'passenger_type' => ['sometimes', 'string', Rule::in(Passenger::PASSENGER_TYPES)],
            'student_id' => 'nullable|string',
            'employee_id' => 'nullable|string',
            'phone_number' => 'nullable|string|max:32',
            'proof_document_path' => 'nullable|string',
            'verification_status' => ['sometimes', 'string', Rule::in(Passenger::VERIFICATION_STATUSES)],
            'passenger_status' => ['sometimes', 'string', Rule::in(Passenger::PASSENGER_STATUSES)],
        ];
    }
}
