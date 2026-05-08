<?php

namespace Tests\Feature;

use App\Events\RideAccepted;
use App\Models\Driver;
use App\Models\DriverAssignment;
use App\Models\PickupRequest;
use App\Models\Route as ShuttleRoute;
use App\Models\Stop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DriverAssignmentApiConsistencyTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaders(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        return [
            'Authorization' => "Bearer {$token}",
        ];
    }

    private function createDriver(int $sequence): Driver
    {
        $user = User::factory()->create();

        return Driver::create([
            'user_id' => $user->id,
            'full_name' => "Driver {$sequence}",
            'license_number' => "LIC-{$sequence}",
            'is_available' => true,
            'driver_status' => 'active',
        ]);
    }

    private function createPickupRequest(int $sequence): PickupRequest
    {
        $passengerUser = User::factory()->create();

        $route = ShuttleRoute::create([
            'name' => "Route {$sequence}",
            'start_location' => 'Start',
            'end_location' => 'End',
            'distance_km' => 4.2,
            'estimated_duration_minutes' => 15,
            'is_active' => true,
        ]);

        $pickupStop = Stop::create([
            'route_id' => $route->id,
            'name' => 'Pickup Stop',
            'sequence' => 1,
            'latitude' => 14.6543210,
            'longitude' => 121.12345678,
            'is_active' => true,
        ]);

        $dropoffStop = Stop::create([
            'route_id' => $route->id,
            'name' => 'Dropoff Stop',
            'sequence' => 2,
            'latitude' => 14.6543220,
            'longitude' => 121.12345778,
            'is_active' => true,
        ]);

        return PickupRequest::create([
            'user_id' => $passengerUser->id,
            'route_id' => $route->id,
            'pickup_stop_id' => $pickupStop->id,
            'dropoff_stop_id' => $dropoffStop->id,
            'status' => 'pending',
        ]);
    }

    public function test_store_upserts_assignment_and_syncs_pickup_request(): void
    {
        $driverA = $this->createDriver(1);
        $driverB = $this->createDriver(2);
        $pickupRequest = $this->createPickupRequest(1);

        $firstResponse = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver-assignments', [
                'driver_id' => $driverA->id,
                'pickup_request_id' => $pickupRequest->id,
            ]);

        $firstResponse->assertStatus(201)
            ->assertJsonPath('pickup_request_id', $pickupRequest->id)
            ->assertJsonPath('driver_id', $driverA->id);

        $pickupRequest->refresh();
        $this->assertSame('accepted', $pickupRequest->status);
        $this->assertNotNull($pickupRequest->assigned_at);

        $secondResponse = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver-assignments', [
                'driver_id' => $driverB->id,
                'pickup_request_id' => $pickupRequest->id,
            ]);

        $secondResponse->assertStatus(201)
            ->assertJsonPath('pickup_request_id', $pickupRequest->id)
            ->assertJsonPath('driver_id', $driverB->id);

        $this->assertSame(
            1,
            DriverAssignment::where('pickup_request_id', $pickupRequest->id)->count(),
            'Only one assignment should exist per pickup request.'
        );
    }

    public function test_update_syncs_pickup_request_status(): void
    {
        $driver = $this->createDriver(3);
        $pickupRequest = $this->createPickupRequest(2);

        $assignment = DriverAssignment::create([
            'driver_id' => $driver->id,
            'pickup_request_id' => $pickupRequest->id,
            'status' => 'active',
            'assigned_at' => now(),
        ]);

        $pickupRequest->update([
            'status' => 'accepted',
            'assigned_at' => now(),
        ]);

        $response = $this->withHeaders($this->authHeaders())
            ->patchJson("/api/driver-assignments/{$assignment->id}", [
                'status' => 'completed',
            ]);

        $response->assertOk()->assertJsonPath('status', 'completed');

        $pickupRequest->refresh();
        $this->assertSame('completed', $pickupRequest->status);
        $this->assertNotNull($pickupRequest->completed_at);
    }

    public function test_destroy_resets_pending_status_when_pickup_was_accepted(): void
    {
        $driver = $this->createDriver(4);
        $pickupRequest = $this->createPickupRequest(3);

        $assignment = DriverAssignment::create([
            'driver_id' => $driver->id,
            'pickup_request_id' => $pickupRequest->id,
            'status' => 'active',
            'assigned_at' => now(),
        ]);

        $pickupRequest->update([
            'status' => 'accepted',
            'assigned_at' => now(),
        ]);

        $response = $this->withHeaders($this->authHeaders())
            ->deleteJson("/api/driver-assignments/{$assignment->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('driver_assignments', ['id' => $assignment->id]);

        $pickupRequest->refresh();
        $this->assertSame('pending', $pickupRequest->status);
        $this->assertNull($pickupRequest->assigned_at);
    }

    public function test_store_rejects_assignment_for_completed_pickup_request(): void
    {
        $driver = $this->createDriver(5);
        $pickupRequest = $this->createPickupRequest(4);

        $pickupRequest->update(['status' => 'completed']);

        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver-assignments', [
                'driver_id' => $driver->id,
                'pickup_request_id' => $pickupRequest->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Completed or cancelled requests cannot be reassigned.');

        $this->assertDatabaseMissing('driver_assignments', [
            'pickup_request_id' => $pickupRequest->id,
        ]);
    }

    public function test_store_dispatches_ride_accepted_on_passenger_and_admin_channels(): void
    {
        Event::fake([RideAccepted::class]);
        Mail::fake();

        $driver = $this->createDriver(10);
        $pickupRequest = $this->createPickupRequest(10);

        $this->withHeaders($this->authHeaders())
            ->postJson('/api/driver-assignments', [
                'driver_id' => $driver->id,
                'pickup_request_id' => $pickupRequest->id,
            ])
            ->assertStatus(201);

        Event::assertDispatched(RideAccepted::class, function (RideAccepted $e) {
            $names = collect($e->broadcastOn())->map(fn ($ch) => $ch->name)->all();

            return in_array('admin-rides', $names, true)
                && collect($names)->contains(fn (string $n) => str_starts_with($n, 'passenger-'));
        });
    }
}
