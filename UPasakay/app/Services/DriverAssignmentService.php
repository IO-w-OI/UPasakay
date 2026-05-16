<?php

namespace App\Services;

use App\Events\RideAccepted;
use App\Mail\BookingConfirmed;
use App\Models\DeviceToken;
use App\Models\DriverAssignment;
use App\Models\PickupRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use InvalidArgumentException;

class DriverAssignmentService
{
    public function __construct(
        private ExpoPushService $expoPush,
    ) {}

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

        $assignment = DB::transaction(function () use ($driverId, $pickupRequest, $status) {
            $assignment = DriverAssignment::updateOrCreate(
                ['pickup_request_id' => $pickupRequest->id],
                [
                    'driver_id' => $driverId,
                    'status' => $status,
                    'assigned_at' => now(),
                ]
            );

            $pickupRequest->update($this->pickupUpdatesForStatus($status));

            return $assignment->fresh([
                'driver.user',
                'driver.shuttle',
                'pickupRequest',
            ]);
        });

        $pickupRequestForNotify = PickupRequest::query()
            ->with([
                'user.passenger',
                'route',
                'pickupStop',
                'dropoffStop',
                'assignment.driver.user',
                'assignment.driver.shuttle',
            ])
            ->findOrFail($pickupRequest->id);

        broadcast(new RideAccepted($pickupRequestForNotify));

        $tokens = DeviceToken::expoTokensForUser($pickupRequestForNotify->user);
        if (! empty($tokens)) {
            $eta = $pickupRequestForNotify->eta_minutes;
            $body = $eta
                ? "Your driver is on the way — about {$eta} min away."
                : 'Your driver is on the way.';

            $this->expoPush->send(
                $tokens,
                'Driver assigned',
                $body,
                ['type' => 'ride_accepted', 'pickup_request_id' => $pickupRequestForNotify->id],
            );
        }

        if ($pickupRequestForNotify->user?->email) {
            Mail::to($pickupRequestForNotify->user->email)->send(new BookingConfirmed($pickupRequestForNotify));
        }

        return $assignment;
    }

    /**
     * Update an assignment status and mirror the related pickup request status.
     */
    public function updateStatus(DriverAssignment $assignment, string $status): DriverAssignment
    {
        $fresh = DB::transaction(function () use ($assignment, $status) {
            $assignment->update(['status' => $status]);

            if ($assignment->pickupRequest) {
                $assignment->pickupRequest->update($this->pickupUpdatesForStatus($status));
            }

            return $assignment->fresh(['driver', 'pickupRequest.user.passenger']);
        });

        if ($status === 'completed' && $fresh->pickupRequest) {
            $tokens = DeviceToken::expoTokensForUser($fresh->pickupRequest->user);
            if (! empty($tokens)) {
                $this->expoPush->send(
                    $tokens,
                    'Ride completed',
                    'Thanks for riding with UPasakay! Tap to leave feedback.',
                    ['type' => 'ride_completed', 'pickup_request_id' => $fresh->pickupRequest->id],
                );
            }
        }

        return $fresh;
    }

    /**
     * Delete an assignment and reset pickup request status if it was accepted.
     */
    public function delete(DriverAssignment $assignment): void
    {
        DB::transaction(function () use ($assignment) {
            $pickupRequest = $assignment->pickupRequest;

            $assignment->delete();

            if ($pickupRequest && $pickupRequest->status === 'accepted') {
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
            default => ['status' => 'accepted', 'assigned_at' => now(), 'completed_at' => null],
        };
    }
}
