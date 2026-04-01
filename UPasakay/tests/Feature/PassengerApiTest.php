<?php

namespace Tests\Feature;

use App\Models\Passenger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PassengerApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper: create an authenticated user and return headers with a valid token.
     */
    private function authHeaders(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    /**
     * Helper: create a passenger with its user.
     */
    private function createPassenger(array $overrides = []): Passenger
    {
        $user = User::factory()->create();

        return Passenger::create(array_merge([
            'user_id' => $user->id,
            'passenger_number' => 'P-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            'department' => 'Engineering',
            'passenger_type' => 'student',
        ], $overrides));
    }

    // ── INDEX ────────────────────────────────────────────────────────────

    public function test_index_returns_paginated_passengers(): void
    {
        $this->createPassenger();
        $this->createPassenger();

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/passengers');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['user_id', 'passenger_number', 'department', 'passenger_type']],
                'current_page',
                'last_page',
            ]);
    }

    // ── STORE ────────────────────────────────────────────────────────────

    public function test_store_creates_passenger_and_user(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/passengers', [
                'email' => 'student@test.com',
                'password' => 'password123',
                'passenger_number' => 'STU-001',
                'department' => 'Computer Science',
                'passenger_type' => 'student',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.passenger_number', 'STU-001');

        $this->assertDatabaseHas('users', ['email' => 'student@test.com']);
        $this->assertDatabaseHas('passengers', ['passenger_number' => 'STU-001']);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/passengers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password', 'passenger_number']);
    }

    public function test_store_rejects_duplicate_passenger_number(): void
    {
        $this->createPassenger(['passenger_number' => 'DUP-001']);

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/passengers', [
                'email' => 'new@test.com',
                'password' => 'password123',
                'passenger_number' => 'DUP-001',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('passenger_number');
    }

    public function test_store_rejects_invalid_passenger_type(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/passengers', [
                'email' => 'type@test.com',
                'password' => 'password123',
                'passenger_number' => 'TYPE-001',
                'passenger_type' => 'alien',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('passenger_type');
    }

    // ── SHOW ─────────────────────────────────────────────────────────────

    public function test_show_returns_passenger(): void
    {
        $passenger = $this->createPassenger();

        $response = $this->withHeaders($this->authHeaders())
            ->getJson("/api/passengers/{$passenger->user_id}");

        $response->assertOk()
            ->assertJsonPath('data.user_id', $passenger->user_id);
    }

    public function test_show_returns_404_for_missing_passenger(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/passengers/99999');

        $response->assertStatus(404);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────

    public function test_update_modifies_passenger_fields(): void
    {
        $passenger = $this->createPassenger(['department' => 'Old Dept']);

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/passengers/{$passenger->user_id}", [
                'department' => 'New Department',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.department', 'New Department');

        $this->assertDatabaseHas('passengers', [
            'user_id' => $passenger->user_id,
            'department' => 'New Department',
        ]);
    }

    public function test_update_returns_404_for_missing_passenger(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->putJson('/api/passengers/99999', ['department' => 'X']);

        $response->assertStatus(404);
    }

    // ── DESTROY ──────────────────────────────────────────────────────────

    public function test_destroy_deletes_passenger(): void
    {
        $passenger = $this->createPassenger();

        $response = $this->withHeaders($this->authHeaders())
            ->deleteJson("/api/passengers/{$passenger->user_id}");

        $response->assertOk()
            ->assertJson(['message' => 'Passenger deleted successfully.']);

        $this->assertDatabaseMissing('passengers', [
            'user_id' => $passenger->user_id,
        ]);
    }

    public function test_destroy_returns_404_for_missing_passenger(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->deleteJson('/api/passengers/99999');

        $response->assertStatus(404);
    }
}
