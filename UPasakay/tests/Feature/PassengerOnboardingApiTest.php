<?php

namespace Tests\Feature;

use App\Models\Passenger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PassengerOnboardingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_response_includes_onboarding_and_profile_state(): void
    {
        $response = $this->postJson('/api/register', [
            'full_name' => 'Mobile Passenger',
            'email' => 'mobile-passenger@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.onboarding.required', true)
            ->assertJsonPath('data.passenger.verification_status', 'pending')
            ->assertJsonPath('data.passenger.profile_completed', false)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'email'],
                    'passenger' => [
                        'id',
                        'passenger_number',
                        'passenger_type',
                        'verification_status',
                        'passenger_status',
                        'profile_completed',
                    ],
                    'onboarding' => ['required', 'profile_completed', 'next_route'],
                    'token',
                ],
            ]);
    }

    public function test_student_profile_completion_requires_student_id_and_proof_document(): void
    {
        $user = User::create([
            'name' => 'Student User',
            'email' => 'student-user@example.com',
            'password_hash' => 'SecurePassword123!',
        ]);

        $passenger = Passenger::create([
            'user_id' => $user->id,
            'full_name' => 'Student User',
            'email' => $user->email,
            'password_hash' => 'SecurePassword123!',
            'passenger_number' => 'STU-2001',
            'passenger_type' => 'student',
            'verification_status' => 'pending',
            'passenger_status' => 'active',
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/passenger/profile/complete', [
            'full_name' => 'Student User',
            'passenger_type' => 'student',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['student_id', 'proof_document_path']);

        $validResponse = $this->withToken($token)->postJson('/api/passenger/profile/complete', [
            'full_name' => 'Student User',
            'phone_number' => '09171234567',
            'passenger_type' => 'student',
            'student_id' => '2020-12345',
            'proof_document_path' => 'proofs/student-user-id.png',
        ]);

        $validResponse->assertOk()
            ->assertJsonPath('data.passenger.profile_completed', true)
            ->assertJsonPath('data.onboarding.required', false);

        $this->assertDatabaseHas('passengers', [
            'id' => $passenger->id,
            'student_id' => '2020-12345',
            'profile_completed' => true,
        ]);
    }

    public function test_faculty_profile_completion_requires_department_employee_id_and_proof(): void
    {
        $passenger = Passenger::create([
            'full_name' => 'Faculty Member',
            'email' => 'faculty@example.com',
            'password_hash' => 'SecurePassword123!',
            'passenger_number' => 'FAC-2001',
            'passenger_type' => 'faculty',
            'verification_status' => 'pending',
            'passenger_status' => 'active',
        ]);

        $token = $passenger->createToken('mobile-app')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/passenger/profile/complete', [
            'full_name' => 'Faculty Member',
            'passenger_type' => 'faculty',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['department_office', 'employee_id', 'proof_document_path']);

        $validResponse = $this->withToken($token)->postJson('/api/passenger/profile/complete', [
            'full_name' => 'Faculty Member',
            'passenger_type' => 'faculty',
            'department_office' => 'College of Science',
            'employee_id' => 'EMP-9001',
            'proof_document_path' => 'proofs/faculty-id.png',
        ]);

        $validResponse->assertOk()
            ->assertJsonPath('data.passenger.profile_completed', true)
            ->assertJsonPath('data.onboarding.next_route', 'UserRecents');
    }

    public function test_verification_endpoint_returns_current_status_values(): void
    {
        $user = User::create([
            'name' => 'Verification User',
            'email' => 'verification-user@example.com',
            'password_hash' => 'SecurePassword123!',
        ]);

        Passenger::create([
            'user_id' => $user->id,
            'full_name' => 'Verification User',
            'email' => $user->email,
            'password_hash' => 'SecurePassword123!',
            'passenger_number' => 'VER-2001',
            'passenger_type' => 'other',
            'verification_status' => 'pending',
            'passenger_status' => 'active',
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/passenger/profile/verification');

        $response->assertOk()
            ->assertJsonPath('data.verification_status', 'pending')
            ->assertJsonPath('data.passenger_status', 'active')
            ->assertJsonPath('data.profile_completed', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'verification_status',
                    'passenger_status',
                    'reviewed_at',
                    'profile_completed',
                ],
            ]);
    }

    public function test_verification_status_changes_are_reflected_after_refresh(): void
    {
        $user = User::create([
            'name' => 'Refresh User',
            'email' => 'refresh-user@example.com',
            'password_hash' => 'SecurePassword123!',
        ]);

        $passenger = Passenger::create([
            'user_id' => $user->id,
            'full_name' => 'Refresh User',
            'email' => $user->email,
            'password_hash' => 'SecurePassword123!',
            'passenger_number' => 'REF-2001',
            'passenger_type' => 'other',
            'verification_status' => 'pending',
            'passenger_status' => 'active',
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/passenger/profile/verification')
            ->assertOk()
            ->assertJsonPath('data.verification_status', 'pending')
            ->assertJsonPath('data.passenger_status', 'active');

        $passenger->update([
            'verification_status' => 'approved',
            'passenger_status' => 'blocked',
            'reviewed_at' => now(),
        ]);

        $this->withToken($token)
            ->getJson('/api/passenger/profile/verification')
            ->assertOk()
            ->assertJsonPath('data.verification_status', 'approved')
            ->assertJsonPath('data.passenger_status', 'blocked');
    }
}
