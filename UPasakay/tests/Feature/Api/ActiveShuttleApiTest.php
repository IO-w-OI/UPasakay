<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Driver;
use App\Models\Shuttle;
use App\Models\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ActiveShuttleApiTest extends TestCase
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
            'driver_id' => $this->driver->id,
        ]);
    }

    /** @test */
    public function can_get_active_shuttle()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'data' => [
                'shuttle' => ['id', 'code', 'plate_number', 'type', 'capacity', 'status', 'is_active'],
                'driver' => ['id', 'full_name', 'license_number', 'status', 'is_available'],
                'route' => ['id', 'name', 'start_location', 'end_location', 'distance_km', 'estimated_duration_minutes', 'is_active', 'stops'],
            ]
        ]);
    }

    /** @test */
    public function can_filter_active_shuttle_by_route_id()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson("/api/shuttle/active?route_id={$this->route->id}");

        $response->assertStatus(200);
        $this->assertEquals($this->route->id, $response->json('data.route.id'));
    }

    /** @test */
    public function returns_404_when_no_active_shuttle()
    {
        $this->shuttle->delete();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active');

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
            'message' => 'No active shuttle found'
        ]);
    }

    /** @test */
    public function returns_404_when_shuttle_is_offline()
    {
        $this->shuttle->update(['status' => 'offline']);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active');

        $response->assertStatus(404);
    }

    /** @test */
    public function requires_authentication()
    {
        $response = $this->getJson('/api/shuttle/active');
        $response->assertStatus(401);
    }

    /** @test */
    public function can_get_all_active_shuttles()
    {
        Shuttle::factory()->create([
            'is_active' => true,
            'status' => 'active'
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active/all');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertGreaterThanOrEqual(2, count($response->json('data')));
    }

    /** @test */
    public function all_active_shuttles_includes_required_fields()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active/all');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'code',
                    'plate_number',
                    'type',
                    'capacity',
                    'status',
                    'driver',
                    'route'
                ]
            ]
        ]);
    }

    /** @test */
    public function returns_404_when_no_shuttles_active()
    {
        $this->shuttle->delete();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active/all');

        $response->assertStatus(404);
    }

    /** @test */
    public function inactive_shuttle_not_returned()
    {
        $this->shuttle->update(['is_active' => false]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/shuttle/active');

        $response->assertStatus(404);
    }
}