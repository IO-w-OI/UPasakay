<?php

namespace App\Services;

use App\Models\DriverAssignment;
use App\Models\PickupRequest;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class DriverAssignmentService
{
    /**
     * Assign a driver to a pickup request while keeping assignment and pickup states in sync.
     */
    public function assignByIds(int $driverId, int $pickupRequestId, string $status = 'active'): DriverAssignment
    {
        $pickupRequest = PickupRequest::query()->findOrFail($pickupRequestId);

        return $this->assignToPickupRequest($driverId, $pickupRequest, $status);
    }

    /**
     * Assign a driver to an existing pickup request model.
     */
    public function assignToPickupRequest(int $driverId, PickupRequest $pickupRequest, string $status = 'active'): DriverAssignment
    {
        if (in_array($pickupRequest->status, ['completed', 'cancelled'], true)) {
            throw new InvalidArgumentException('Completed or cancelled requests cannot be reassigned.');
        }

        return DB::transaction(function () use ($driverId, $pickupRequest, $status) {
            $assignment = DriverAssignment::updateOrCreate(
                ['pickup_request_id' => $pickupRequest->id],
                [
                    'driver_id' => $driverId,
                    'status' => $status,
                    'assigned_at' => now(),
                ]
            );

            $pickupRequest->update($this->pickupUpdatesForStatus($status));

            return $assignment->fresh(['driver', 'pickupRequest']);
        });
    }

    /**
     * Update an assignment status and mirror the related pickup request status.
     */
    public function updateStatus(DriverAssignment $assignment, string $status): DriverAssignment
    {
        return DB::transaction(function () use ($assignment, $status) {
            $assignment->update(['status' => $status]);

            if ($assignment->pickupRequest) {
                $assignment->pickupRequest->update($this->pickupUpdatesForStatus($status));
            }

            return $assignment->fresh(['driver', 'pickupRequest']);
        });
    }

    /**
     * Delete an assignment and reset pickup request status if it was assigned.
     */
    public function delete(DriverAssignment $assignment): void
    {
        DB::transaction(function () use ($assignment) {
            $pickupRequest = $assignment->pickupRequest;

            $assignment->delete();

            if ($pickupRequest && $pickupRequest->status === 'assigned') {
                $pickupRequest->update([
                    'status' => 'pending',
                    'assigned_at' => null,
                ]);
            }
        });
    }

    /**
     * Resolve how pickup request fields should change for an assignment status.
     *
     * @return array<string, mixed>
     */
    private function pickupUpdatesForStatus(string $status): array
    {
        return match ($status) {
            'completed' => ['status' => 'completed', 'completed_at' => now()],
            'cancelled' => ['status' => 'cancelled'],
            default => ['status' => 'assigned', 'assigned_at' => now(), 'completed_at' => null],
        };
    }
}
