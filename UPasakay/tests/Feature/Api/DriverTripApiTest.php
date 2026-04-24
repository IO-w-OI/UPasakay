<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Driver;
use App\Models\Shuttle;
use App\Models\Route;
use App\Models\Trip;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DriverTripApiTest extends TestCase
{
    use RefreshDatabase;

    private $driver;
    private $token;
    private $shuttle;
    private $route;

    protected function setUp(): void
    {
        parent::setUp();
        
        $user = User::factory()->create();
        $this->driver = Driver::factory()->create(['user_id' => $user->id]);
        $this->token = $user->createToken('test-token')->plainTextToken;
        $this->route = Route::factory()->create(['is_active' => true]);
        $this->shuttle = Shuttle::factory()->create([
            'is_active' => true,
            'status' => 'active',
            'route_id' => $this->route->id,
            'driver_id' => $this->driver->id
        ]);
    }

    /** @test */
    public function can_start_trip()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/start', [
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Trip started successfully',
            'data' => ['status' => 'idle']
        ]);
        $response->assertJsonStructure([
            'data' => ['trip_id', 'driver_id', 'shuttle_id', 'route_id', 'status', 'created_at']
        ]);

        $this->assertDatabaseHas('trips', [
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'idle'
        ]);
    }

    /** @test */
    public function cannot_start_duplicate_active_trip()
    {
        $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/start', [
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/start', [
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id
        ]);

        $response->assertStatus(409);
        $response->assertJson([
            'success' => false,
            'message' => 'Driver already has an active trip.'
        ]);
    }

    /** @test */
    public function requires_valid_shuttle_id()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/start', [
            'shuttle_id' => 9999,
            'route_id' => $this->route->id
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('shuttle_id');
    }

    /** @test */
    public function requires_valid_route_id()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/start', [
            'shuttle_id' => $this->shuttle->id,
            'route_id' => 9999
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('route_id');
    }

    /** @test */
    public function requires_authentication_to_start_trip()
    {
        $response = $this->postJson('/api/mobile/driver/trip/start', [
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function can_update_trip_status()
    {
        $trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'idle'
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/status', [
            'status' => 'en_route'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'previous_status' => 'idle',
                'current_status' => 'en_route'
            ]
        ]);

        $this->assertDatabaseHas('trips', [
            'id' => $trip->id,
            'status' => 'en_route'
        ]);
    }

    /** @test */
    public function sets_started_at_on_en_route_transition()
    {
        $trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'idle',
            'started_at' => null
        ]);

        $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/status', [
            'status' => 'en_route'
        ]);

        $trip->refresh();
        $this->assertNotNull($trip->started_at);
    }

    /** @test */
    public function sets_completed_at_on_completed_transition()
    {
        $trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'arrived',
            'completed_at' => null
        ]);

        $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/status', [
            'status' => 'completed'
        ]);

        $trip->refresh();
        $this->assertNotNull($trip->completed_at);
    }

    /** @test */
    public function rejects_invalid_status()
    {
        Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/status', [
            'status' => 'invalid_status'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('status');
    }

    /** @test */
    public function accepts_all_valid_statuses()
    {
        $validStatuses = ['idle', 'en_route', 'arrived', 'completed'];

        foreach ($validStatuses as $status) {
            $trip = Trip::factory()->create([
                'driver_id' => $this->driver->id,
                'shuttle_id' => $this->shuttle->id,
                'route_id' => $this->route->id,
                'status' => 'idle'
            ]);

            $response = $this->withHeaders([
                'Authorization' => "Bearer {$this->token}",
            ])->postJson('/api/mobile/driver/trip/status', [
                'status' => $status
            ]);

            $response->assertStatus(200);
            $this->assertEquals($status, $response->json('data.current_status'));
        }
    }

    /** @test */
    public function returns_error_when_no_active_trip()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/status', [
            'status' => 'en_route'
        ]);

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
            'message' => 'No active trip found for driver. Please start a trip first.'
        ]);
    }

    /** @test */
    public function can_get_current_trip()
    {
        $trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'en_route'
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/mobile/driver/trip/current');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'trip_id' => $trip->id,
                'status' => 'en_route'
            ]
        ]);
        $response->assertJsonStructure([
            'data' => [
                'trip_id',
                'driver_id',
                'shuttle' => ['id', 'code', 'plate_number'],
                'route' => ['id', 'name', 'start_location', 'end_location'],
                'status',
                'created_at',
                'updated_at'
            ]
        ]);
    }

    /** @test */
    public function returns_404_when_getting_current_trip_but_none_exist()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/mobile/driver/trip/current');

        $response->assertStatus(404);
    }

    /** @test */
    public function can_end_trip()
    {
        $trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'arrived',
            'completed_at' => null
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/end');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => ['status' => 'completed']
        ]);

        $trip->refresh();
        $this->assertEquals('completed', $trip->status);
        $this->assertNotNull($trip->completed_at);
    }

    /** @test */
    public function returns_404_when_ending_trip_but_none_exist()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/end');

        $response->assertStatus(404);
    }

    /** @test */
    public function can_get_trip_status_public()
    {
        $trip = Trip::factory()->create([
            'status' => 'en_route'
        ]);

        $response = $this->getJson("/api/trip/{$trip->id}/status");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'trip_id' => $trip->id,
                'status' => 'en_route'
            ]
        ]);
        $response->assertJsonStructure([
            'data' => [
                'trip_id',
                'driver' => ['id', 'full_name'],
                'shuttle' => ['id', 'plate_number'],
                'route' => ['id', 'name'],
                'status',
                'started_at',
                'completed_at'
            ]
        ]);
    }

    /** @test */
    public function public_trip_status_endpoint_requires_no_authentication()
    {
        $trip = Trip::factory()->create(['status' => 'en_route']);

        $response = $this->getJson("/api/trip/{$trip->id}/status");

        $response->assertStatus(200);
    }

    /** @test */
    public function public_trip_status_returns_404_for_missing_trip()
    {
        $response = $this->getJson('/api/trip/9999/status');

        $response->assertStatus(404);
    }

    /** @test */
    public function cannot_end_completed_trip()
    {
        $trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'completed'
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/trip/end');

        $response->assertStatus(404);
    }
}