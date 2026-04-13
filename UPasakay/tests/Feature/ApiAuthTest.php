<?php

namespace Tests\Feature;

use App\Models\Passenger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    // ── Public routes ────────────────────────────────────────────────────

    public function test_register_creates_passenger_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'full_name' => 'New Passenger',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'passenger_number' => 'REG-1001',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'passenger' => ['id', 'email'], 'token']);

        $this->assertDatabaseHas('passengers', ['email' => 'newuser@example.com']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        Passenger::create([
            'full_name' => 'Taken Passenger',
            'email' => 'taken@example.com',
            'password_hash' => Hash::make('password123'),
            'passenger_number' => 'REG-1002',
            'passenger_type' => 'student',
            'passenger_status' => 'active',
        ]);

        $response = $this->postJson('/api/register', [
            'full_name' => 'Another Passenger',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'passenger_number' => 'REG-1003',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_login_returns_token_with_valid_credentials(): void
    {
        Passenger::create([
            'full_name' => 'Auth Passenger',
            'email' => 'user@example.com',
            'password_hash' => Hash::make('secret123'),
            'passenger_number' => 'REG-1004',
            'passenger_type' => 'student',
            'passenger_status' => 'active',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'passenger' => ['id', 'email'], 'token']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        Passenger::create([
            'full_name' => 'Auth Passenger',
            'email' => 'user@example.com',
            'password_hash' => Hash::make('correctpassword'),
            'passenger_number' => 'REG-1005',
            'passenger_type' => 'student',
            'passenger_status' => 'active',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    // ── Protected routes ────────────────────────────────────────────────

    public function test_protected_route_returns_401_without_token(): void
    {
        $response = $this->getJson('/api/passengers');

        $response->assertStatus(401);
    }

    public function test_protected_routes_return_401_without_token(): void
    {
        $endpoints = [
            ['GET', '/api/routes'],
            ['GET', '/api/stops'],
            ['GET', '/api/shuttles'],
            ['GET', '/api/drivers'],
            ['GET', '/api/pickup-requests'],
            ['GET', '/api/driver-assignments'],
            ['GET', '/api/shuttle-locations'],
        ];

        foreach ($endpoints as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(401);
        }
    }

    public function test_authenticated_request_can_access_protected_route(): void
    {
        $passenger = Passenger::create([
            'full_name' => 'Protected Passenger',
            'email' => 'protected@example.com',
            'password_hash' => Hash::make('secret123'),
            'passenger_number' => 'REG-1006',
            'passenger_type' => 'student',
            'passenger_status' => 'active',
        ]);
        $token = $passenger->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/passengers');

        $response->assertStatus(200);
    }

    public function test_logout_revokes_token(): void
    {
        $passenger = Passenger::create([
            'full_name' => 'Logout Passenger',
            'email' => 'logout@example.com',
            'password_hash' => Hash::make('secret123'),
            'passenger_number' => 'REG-1007',
            'passenger_type' => 'student',
            'passenger_status' => 'active',
        ]);
        $token = $passenger->createToken('test-token')->plainTextToken;

        // Logout
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);

        // Token should be removed from storage.
        $this->assertCount(0, $passenger->fresh()->tokens);
    }
}
