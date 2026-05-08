<?php

namespace Tests\Feature;

use App\Events\ShuttleLocationUpdated;
use App\Models\Driver;
use App\Models\Route as ShuttleRoute;
use App\Models\Shuttle;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class DriverLocationApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{Authorization: string}
     */
    private function authHeaders(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    /**
     * @return array{driver: Driver, shuttle: Shuttle}
     */
    private function createDriverWithShuttle(): array
    {
        $driverUser = User::factory()->create();
        $driver = Driver::create([
            'user_id' => $driverUser->id,
            'full_name' => 'Test Driver',
            'license_number' => 'LIC-'.uniqid(),
            'is_available' => true,
            'driver_status' => 'active',
        ]);

        $route = ShuttleRoute::create([
            'name' => 'Test Route',
            'start_location' => 'A',
            'end_location' => 'B',
            'distance_km' => 1,
            'estimated_duration_minutes' => 10,
            'is_active' => true,
        ]);

        $shuttle = Shuttle::create([
            'plate_number' => 'PLT-'.uniqid(),
            'capacity' => 12,
            'shuttle_code' => 'SH-'.uniqid(),
            'shuttle_type' => 'van',
            'is_active' => true,
            'status' => 'active',
            'route_id' => $route->id,
            'driver_id' => $driver->id,
        ]);

        return ['driver' => $driver, 'shuttle' => $shuttle];
    }

    public function test_store_from_driver_with_driver_id_creates_location_and_dispatches_event(): void
    {
        Event::fake([ShuttleLocationUpdated::class]);
        ['driver' => $driver, 'shuttle' => $shuttle] = $this->createDriverWithShuttle();

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver/location', [
                'driver_id' => $driver->id,
                'latitude' => 10.3157,
                'longitude' => 123.8854,
                'speed_kmh' => 25.5,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('shuttle_id', $shuttle->id)
            ->assertJsonPath('driver_id', $driver->id);

        $this->assertDatabaseHas('shuttle_locations', [
            'shuttle_id' => $shuttle->id,
        ]);

        Event::assertDispatched(ShuttleLocationUpdated::class, function (ShuttleLocationUpdated $e) use ($shuttle) {
            return $e->shuttleId === $shuttle->id
                && abs($e->latitude - 10.3157) < 0.0001
                && abs($e->longitude - 123.8854) < 0.0001;
        });
    }

    public function test_store_from_driver_with_shuttle_id_only_succeeds(): void
    {
        Event::fake([ShuttleLocationUpdated::class]);
        ['shuttle' => $shuttle] = $this->createDriverWithShuttle();

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver/location', [
                'shuttle_id' => $shuttle->id,
                'latitude' => 10.32,
                'longitude' => 123.89,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('shuttle_id', $shuttle->id);

        $this->assertDatabaseHas('shuttle_locations', [
            'shuttle_id' => $shuttle->id,
        ]);

        Event::assertDispatched(ShuttleLocationUpdated::class);
    }

    public function test_store_from_driver_requires_driver_id_or_shuttle_id(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver/location', [
                'latitude' => 10.3157,
                'longitude' => 123.8854,
            ]);

        $response->assertStatus(422);
    }

    public function test_store_from_driver_returns_422_when_driver_has_no_shuttle(): void
    {
        $driverUser = User::factory()->create();
        $driver = Driver::create([
            'user_id' => $driverUser->id,
            'full_name' => 'Orphan Driver',
            'license_number' => 'LIC-'.uniqid(),
            'is_available' => true,
            'driver_status' => 'active',
        ]);

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver/location', [
                'driver_id' => $driver->id,
                'latitude' => 10.3157,
                'longitude' => 123.8854,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Driver has no shuttle assigned.');
    }

    public function test_store_from_driver_rejects_mismatched_driver_and_shuttle(): void
    {
        ['driver' => $driver1, 'shuttle' => $shuttle1] = $this->createDriverWithShuttle();
        ['driver' => $driver2] = $this->createDriverWithShuttle();

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver/location', [
                'driver_id' => $driver2->id,
                'shuttle_id' => $shuttle1->id,
                'latitude' => 10.3157,
                'longitude' => 123.8854,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'driver_id does not match the shuttle\'s assigned driver.');
    }

    public function test_store_from_driver_requires_authentication(): void
    {
        ['driver' => $driver] = $this->createDriverWithShuttle();

        $response = $this->postJson('/api/driver/location', [
            'driver_id' => $driver->id,
            'latitude' => 10.3157,
            'longitude' => 123.8854,
        ]);

        $response->assertUnauthorized();
    }
}
