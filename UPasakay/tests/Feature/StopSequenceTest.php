<?php

namespace Tests\Feature;

use App\Models\Route;
use App\Models\Stop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StopSequenceTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaders(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    private function createRoute(array $overrides = []): Route
    {
        return Route::create(array_merge([
            'name' => 'Test Route',
            'start_location' => 'Start',
            'end_location' => 'End',
            'distance_km' => 10,
            'estimated_duration_minutes' => 30,
            'is_active' => true,
        ], $overrides));
    }

    // ── Ordered retrieval ────────────────────────────────────────────────

    public function test_stops_are_returned_ordered_by_sequence(): void
    {
        $route = $this->createRoute();

        // Create stops out of order
        Stop::create(['route_id' => $route->id, 'name' => 'Third', 'sequence' => 3, 'latitude' => 10.3, 'longitude' => 123.9, 'is_active' => true]);
        Stop::create(['route_id' => $route->id, 'name' => 'First', 'sequence' => 1, 'latitude' => 10.3, 'longitude' => 123.9, 'is_active' => true]);
        Stop::create(['route_id' => $route->id, 'name' => 'Second', 'sequence' => 2, 'latitude' => 10.3, 'longitude' => 123.9, 'is_active' => true]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/stops?route_id='.$route->id);

        $response->assertOk();

        $names = collect($response->json())->pluck('name')->toArray();
        $this->assertEquals(['First', 'Second', 'Third'], $names);
    }

    // ── Create with sequence ─────────────────────────────────────────────

    public function test_store_accepts_sequence_field(): void
    {
        $route = $this->createRoute();

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/stops', [
                'route_id' => $route->id,
                'name' => 'New Stop',
                'sequence' => 1,
                'latitude' => 10.3,
                'longitude' => 123.9,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('stops', [
            'route_id' => $route->id,
            'name' => 'New Stop',
            'sequence' => 1,
        ]);
    }

    public function test_store_requires_sequence_field(): void
    {
        $route = $this->createRoute();

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/stops', [
                'route_id' => $route->id,
                'name' => 'No Seq',
                'latitude' => 10.3,
                'longitude' => 123.9,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('sequence');
    }

    // ── Duplicate sequence within same route is rejected ─────────────────

    public function test_duplicate_sequence_within_same_route_is_rejected(): void
    {
        $route = $this->createRoute();

        Stop::create(['route_id' => $route->id, 'name' => 'Existing', 'sequence' => 1, 'latitude' => 10.3, 'longitude' => 123.9, 'is_active' => true]);

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/stops', [
                'route_id' => $route->id,
                'name' => 'Duplicate',
                'sequence' => 1,
                'latitude' => 10.3,
                'longitude' => 123.9,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('sequence');
    }

    // ── Same sequence on different route is allowed ───────────────────────

    public function test_same_sequence_on_different_route_is_allowed(): void
    {
        $routeA = $this->createRoute(['name' => 'Route A']);
        $routeB = $this->createRoute(['name' => 'Route B']);

        Stop::create(['route_id' => $routeA->id, 'name' => 'Stop A1', 'sequence' => 1, 'latitude' => 10.3, 'longitude' => 123.9, 'is_active' => true]);

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/stops', [
                'route_id' => $routeB->id,
                'name' => 'Stop B1',
                'sequence' => 1,
                'latitude' => 10.3,
                'longitude' => 123.9,
            ]);

        $response->assertStatus(201);
    }

    // ── Update reflects sequence change ──────────────────────────────────

    public function test_update_sequence_is_reflected(): void
    {
        $route = $this->createRoute();
        $stop = Stop::create(['route_id' => $route->id, 'name' => 'Movable', 'sequence' => 1, 'latitude' => 10.3, 'longitude' => 123.9, 'is_active' => true]);

        $response = $this->withHeaders($this->authHeaders())
            ->putJson("/api/stops/{$stop->id}", ['sequence' => 5]);

        $response->assertOk();

        $this->assertDatabaseHas('stops', [
            'id' => $stop->id,
            'sequence' => 5,
        ]);
    }
}
