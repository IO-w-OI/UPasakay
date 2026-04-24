<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Driver;
use App\Models\Shuttle;
use App\Models\Route;
use App\Models\Trip;
use App\Models\ShuttleLocation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DriverLocationApiTest extends TestCase
{
    use RefreshDatabase;

    private $driver;
    private $token;
    private $shuttle;
    private $route;
    private $trip;

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
        $this->trip = Trip::factory()->create([
            'driver_id' => $this->driver->id,
            'shuttle_id' => $this->shuttle->id,
            'route_id' => $this->route->id,
            'status' => 'idle'
        ]);
    }

    /** @test */
    public function can_update_driver_location()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450,
            'speed_kmh' => 25.5
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Location updated successfully'
        ]);
        $response->assertJsonStructure([
            'data' => [
                'location_id',
                'shuttle_id',
                'latitude',
                'longitude',
                'speed_kmh',
                'recorded_at',
                'saved_at'
            ]
        ]);

        $this->assertDatabaseHas('shuttle_locations', [
            'shuttle_id' => $this->shuttle->id,
            'latitude' => 14.6349,
            'longitude' => 121.0450
        ]);
    }

    /** @test */
    public function can_update_location_without_speed()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('shuttle_locations', [
            'shuttle_id' => $this->shuttle->id,
            'latitude' => 14.6349,
            'speed_kmh' => null
        ]);
    }

    /** @test */
    public function rejects_invalid_latitude()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 95,
            'longitude' => 121.0450
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('latitude');
    }

    /** @test */
    public function rejects_latitude_below_minimum()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => -95,
            'longitude' => 121.0450
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('latitude');
    }

    /** @test */
    public function rejects_invalid_longitude()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 190
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('longitude');
    }

    /** @test */
    public function rejects_longitude_below_minimum()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => -190
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('longitude');
    }

    /** @test */
    public function rejects_speed_over_300_kmh()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450,
            'speed_kmh' => 350
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('speed_kmh');
    }

    /** @test */
    public function rejects_negative_speed()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450,
            'speed_kmh' => -10
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('speed_kmh');
    }

    /** @test */
    public function rejects_future_timestamp()
    {
        $futureTime = now()->addHours(1)->format('Y-m-d H:i:s');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450,
            'timestamp' => $futureTime
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('timestamp');
    }

    /** @test */
    public function accepts_valid_timestamp()
    {
        $pastTime = now()->subMinutes(5)->format('Y-m-d H:i:s');

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450,
            'timestamp' => $pastTime
        ]);

        $response->assertStatus(201);
    }

    /** @test */
    public function updates_shuttle_last_seen_at()
    {
        $this->shuttle->update(['last_seen_at' => now()->subHours(1)]);

        $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450
        ]);

        $this->assertNotNull($this->shuttle->fresh()->last_seen_at);
    }

    /** @test */
    public function requires_authentication()
    {
        $response = $this->postJson('/api/mobile/driver/location/update', [
            'latitude' => 14.6349,
            'longitude' => 121.0450
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function can_get_latest_location()
    {
        ShuttleLocation::factory()->create([
            'shuttle_id' => $this->shuttle->id,
            'latitude' => 14.6349,
            'longitude' => 121.0450
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/mobile/driver/location/latest');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Latest location retrieved'
        ]);
        $response->assertJsonStructure([
            'data' => ['location_id', 'shuttle_id', 'latitude', 'longitude', 'recorded_at']
        ]);
    }

    /** @test */
    public function returns_404_when_no_locations_exist()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/mobile/driver/location/latest');

        $response->assertStatus(404);
    }

    /** @test */
    public function can_batch_upload_locations()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/batch', [
            'locations' => [
                [
                    'latitude' => 14.6349,
                    'longitude' => 121.0450,
                    'speed_kmh' => 25.5
                ],
                [
                    'latitude' => 14.6350,
                    'longitude' => 121.0451,
                    'speed_kmh' => 26.0
                ],
                [
                    'latitude' => 14.6351,
                    'longitude' => 121.0452,
                    'speed_kmh' => 27.0
                ]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'data' => ['locations_saved' => 3]
        ]);

        $this->assertEquals(3, ShuttleLocation::where('shuttle_id', $this->shuttle->id)->count());
    }

    /** @test */
    public function batch_upload_accepts_max_50_locations()
    {
        $locations = [];
        for ($i = 0; $i < 50; $i++) {
            $locations[] = [
                'latitude' => 14.6349 + ($i * 0.0001),
                'longitude' => 121.0450 + ($i * 0.0001),
                'speed_kmh' => 25
            ];
        }

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/batch', [
            'locations' => $locations
        ]);

        $response->assertStatus(201);
        $response->assertJson(['data' => ['locations_saved' => 50]]);
    }

    /** @test */
    public function batch_upload_rejects_more_than_50_locations()
    {
        $locations = [];
        for ($i = 0; $i < 51; $i++) {
            $locations[] = [
                'latitude' => 14.6349,
                'longitude' => 121.0450
            ];
        }

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/batch', [
            'locations' => $locations
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function batch_upload_rejects_empty_locations()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/batch', [
            'locations' => []
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function batch_upload_validates_each_location()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/mobile/driver/location/batch', [
            'locations' => [
                [
                    'latitude' => 14.6349,
                    'longitude' => 121.0450
                ],
                [
                    'latitude' => 95,
                    'longitude' => 121.0451
                ]
            ]
        ]);

        $response->assertStatus(422);
    }
}