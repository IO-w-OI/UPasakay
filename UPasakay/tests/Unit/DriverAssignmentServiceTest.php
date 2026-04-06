<?php

namespace Tests\Unit;

use App\Models\Driver;
use App\Models\DriverAssignment;
use App\Models\PickupRequest;
use App\Models\Route as ShuttleRoute;
use App\Models\Stop;
use App\Models\User;
use App\Services\DriverAssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class DriverAssignmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private function createDriver(int $sequence): Driver
    {
        $user = User::factory()->create();

        return Driver::create([
            'user_id' => $user->id,
            'full_name' => "Driver {$sequence}",
            'license_number' => "UT-LIC-{$sequence}",
            'is_available' => true,
            'driver_status' => 'active',
        ]);
    }

    private function createPickupRequest(int $sequence): PickupRequest
    {
        $passengerUser = User::factory()->create();

        $route = ShuttleRoute::create([
            'name' => "Unit Route {$sequence}",
            'start_location' => 'Start',
            'end_location' => 'End',
            'distance_km' => 3.5,
            'estimated_duration_minutes' => 12,
            'is_active' => true,
        ]);

        $pickupStop = Stop::create([
            'route_id' => $route->id,
            'name' => 'Pickup Stop',
            'sequence' => 1,
            'latitude' => 14.6550000,
            'longitude' => 121.12500000,
            'is_active' => true,
        ]);

        $dropoffStop = Stop::create([
            'route_id' => $route->id,
            'name' => 'Dropoff Stop',
            'sequence' => 2,
            'latitude' => 14.6560000,
            'longitude' => 121.12600000,
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

    public function test_assign_by_ids_upserts_assignment_and_syncs_pickup_request(): void
    {
        $service = app(DriverAssignmentService::class);
        $driverA = $this->createDriver(1);
        $driverB = $this->createDriver(2);
        $pickupRequest = $this->createPickupRequest(1);

        $firstAssignment = $service->assignByIds($driverA->id, $pickupRequest->id);

        $this->assertSame($driverA->id, $firstAssignment->driver_id);

        $pickupRequest->refresh();
        $this->assertSame('assigned', $pickupRequest->status);
        $this->assertNotNull($pickupRequest->assigned_at);

        $secondAssignment = $service->assignByIds($driverB->id, $pickupRequest->id);

        $this->assertSame($driverB->id, $secondAssignment->driver_id);
        $this->assertSame(
            1,
            DriverAssignment::where('pickup_request_id', $pickupRequest->id)->count(),
            'Service should keep a single assignment per pickup request.'
        );
    }

    public function test_assign_to_pickup_request_rejects_completed_or_cancelled_requests(): void
    {
        $service = app(DriverAssignmentService::class);
        $driver = $this->createDriver(3);
        $pickupRequest = $this->createPickupRequest(2);
        $pickupRequest->update(['status' => 'completed']);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Completed or cancelled requests cannot be reassigned.');

        $service->assignToPickupRequest($driver->id, $pickupRequest);
    }

    public function test_update_status_to_completed_syncs_pickup_completion_fields(): void
    {
        $service = app(DriverAssignmentService::class);
        $driver = $this->createDriver(4);
        $pickupRequest = $this->createPickupRequest(3);

        $assignment = DriverAssignment::create([
            'driver_id' => $driver->id,
            'pickup_request_id' => $pickupRequest->id,
            'status' => 'active',
            'assigned_at' => now(),
        ]);

        $pickupRequest->update([
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        $updatedAssignment = $service->updateStatus($assignment, 'completed');

        $this->assertSame('completed', $updatedAssignment->status);

        $pickupRequest->refresh();
        $this->assertSame('completed', $pickupRequest->status);
        $this->assertNotNull($pickupRequest->completed_at);
    }

    public function test_delete_resets_assigned_pickup_request_to_pending(): void
    {
        $service = app(DriverAssignmentService::class);
        $driver = $this->createDriver(5);
        $pickupRequest = $this->createPickupRequest(4);

        $assignment = DriverAssignment::create([
            'driver_id' => $driver->id,
            'pickup_request_id' => $pickupRequest->id,
            'status' => 'active',
            'assigned_at' => now(),
        ]);

        $pickupRequest->update([
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        $service->delete($assignment);

        $this->assertDatabaseMissing('driver_assignments', ['id' => $assignment->id]);

        $pickupRequest->refresh();
        $this->assertSame('pending', $pickupRequest->status);
        $this->assertNull($pickupRequest->assigned_at);
    }

    public function test_update_status_to_cancelled_syncs_pickup_status(): void
    {
        $service = app(DriverAssignmentService::class);
        $driver = $this->createDriver(6);
        $pickupRequest = $this->createPickupRequest(5);

        $assignment = DriverAssignment::create([
            'driver_id' => $driver->id,
            'pickup_request_id' => $pickupRequest->id,
            'status' => 'active',
            'assigned_at' => now(),
        ]);

        $pickupRequest->update([
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        $updatedAssignment = $service->updateStatus($assignment, 'cancelled');

        $this->assertSame('cancelled', $updatedAssignment->status);

        $pickupRequest->refresh();
        $this->assertSame('cancelled', $pickupRequest->status);
        $this->assertNull($pickupRequest->completed_at);
    }
}
