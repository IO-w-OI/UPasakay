<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PassengerProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $passenger = $this->resolvePassenger($request, true);

        return response()->json([
            'success' => true,
            'data' => $this->payload($passenger),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $passenger = $this->resolvePassenger($request, true);

        $validated = $request->validate($this->rules($passenger, false));

        $passenger->fill($this->mappedProfileData($validated));
        $passenger->save();

        return response()->json([
            'success' => true,
            'message' => 'Passenger profile updated successfully.',
            'data' => $this->payload($passenger->fresh()),
        ]);
    }

    public function complete(Request $request): JsonResponse
    {
        $passenger = $this->resolvePassenger($request, true);

        $validated = $request->validate($this->rules($passenger, true));

        $passenger->fill($this->mappedProfileData($validated));
        $passenger->save();

        return response()->json([
            'success' => true,
            'message' => 'Passenger profile completed successfully.',
            'data' => $this->payload($passenger->fresh()),
        ]);
    }

    public function verification(Request $request): JsonResponse
    {
        $passenger = $this->resolvePassenger($request, true);

        return response()->json([
            'success' => true,
            'data' => [
                'verification_status' => $passenger->verification_status,
                'passenger_status' => $passenger->passenger_status,
                'reviewed_at' => $passenger->reviewed_at,
                'profile_completed' => (bool) $passenger->profile_completed,
            ],
        ]);
    }

    private function resolvePassenger(Request $request, bool $createForUser = false): Passenger
    {
        $authUser = $request->user();

        if ($authUser instanceof Passenger) {
            return $authUser;
        }

        if ($authUser instanceof User) {
            $existing = $authUser->passenger()->first();
            if ($existing) {
                return $existing;
            }

            if ($createForUser) {
                return Passenger::create([
                    'user_id' => $authUser->id,
                    'full_name' => $authUser->name,
                    'email' => $authUser->email,
                    'passenger_number' => $this->generatePassengerNumber(),
                    'passenger_type' => 'other',
                    'verification_status' => 'pending',
                    'passenger_status' => 'active',
                ]);
            }
        }

        abort(401, 'Unauthenticated.');
    }

    private function rules(Passenger $passenger, bool $forCompletion): array
    {
        $requiredOrSometimes = $forCompletion ? 'required' : 'sometimes';

        return [
            'full_name' => [$requiredOrSometimes, 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                Rule::unique('passengers', 'email')->ignore($passenger->id),
                Rule::unique('users', 'email')->ignore($passenger->user_id),
            ],
            'phone_number' => ['nullable', 'string', 'max:32'],
            'passenger_type' => [$requiredOrSometimes, 'string', Rule::in(Passenger::PASSENGER_TYPES)],
            'department_office' => ['nullable', 'string', Rule::in(Passenger::DEPARTMENT_OFFICES), 'required_if:passenger_type,faculty,employee'],
            'student_id' => ['nullable', 'string', 'required_if:passenger_type,student'],
            'employee_id' => ['nullable', 'string', 'required_if:passenger_type,faculty,employee'],
            'proof_document_path' => ['nullable', 'string', 'required_unless:passenger_type,other'],
        ];
    }

    private function mappedProfileData(array $validated): array
    {
        $mapped = array_intersect_key($validated, array_flip([
            'full_name',
            'email',
            'phone_number',
            'passenger_type',
            'department_office',
            'student_id',
            'employee_id',
            'proof_document_path',
        ]));

        if (array_key_exists('department_office', $mapped)) {
            $mapped['department'] = $mapped['department_office'];
        }

        return $mapped;
    }

    private function payload(Passenger $passenger): array
    {
        return [
            'passenger' => [
                'id' => $passenger->id,
                'user_id' => $passenger->user_id,
                'full_name' => $passenger->full_name,
                'email' => $passenger->email,
                'phone_number' => $passenger->phone_number,
                'passenger_number' => $passenger->passenger_number,
                'passenger_type' => $passenger->passenger_type,
                'department_office' => $passenger->department_office,
                'student_id' => $passenger->student_id,
                'employee_id' => $passenger->employee_id,
                'verification_status' => $passenger->verification_status,
                'passenger_status' => $passenger->passenger_status,
                'profile_completed' => (bool) $passenger->profile_completed,
                'proof_document_path' => $passenger->proof_document_path,
                'reviewed_at' => $passenger->reviewed_at,
                'created_at' => $passenger->created_at,
                'updated_at' => $passenger->updated_at,
            ],
            'allowed' => [
                'passenger_type' => Passenger::PASSENGER_TYPES,
                'verification_status' => Passenger::VERIFICATION_STATUSES,
                'passenger_status' => Passenger::PASSENGER_STATUSES,
                'department_office' => Passenger::DEPARTMENT_OFFICES,
            ],
            'onboarding' => [
                'required' => ! $passenger->profile_completed,
                'profile_completed' => (bool) $passenger->profile_completed,
                'next_route' => ! $passenger->profile_completed
                    ? 'ProfileOnboarding'
                    : $this->routeForPassengerType($passenger->passenger_type),
            ],
        ];
    }

    private function routeForPassengerType(?string $passengerType): string
    {
        return match ($passengerType) {
            'student' => 'UserHome',
            'faculty' => 'UserRecents',
            'employee' => 'UserMap',
            default => 'UserProfile',
        };
    }

    private function generatePassengerNumber(): string
    {
        do {
            $passengerNumber = 'PASS'.strtoupper(uniqid());
        } while (Passenger::where('passenger_number', $passengerNumber)->exists());

        return $passengerNumber;
    }
}
