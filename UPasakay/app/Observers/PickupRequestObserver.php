<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\PickupRequest;

class PickupRequestObserver
{
    /**
     * Handle the PickupRequest "created" event.
     */
    public function created(PickupRequest $pickupRequest): void
    {
        ActivityLog::log(
            type: 'pickup_created',
            description: "Pickup request #{$pickupRequest->id} created",
            actor: $pickupRequest->user,
            metadata: [
                'pickup_request_id' => $pickupRequest->id,
                'route' => $pickupRequest->route?->name,
                'status' => $pickupRequest->status,
            ],
        );
    }

    /**
     * Handle the PickupRequest "updated" event.
     */
    public function updated(PickupRequest $pickupRequest): void
    {
        // Only log status changes
        if (! $pickupRequest->wasChanged('status')) {
            return;
        }

        $type = match ($pickupRequest->status) {
            'completed' => 'pickup_completed',
            'cancelled' => 'pickup_cancelled',
            default => 'pickup_pending',
        };

        $description = match ($pickupRequest->status) {
            'completed' => "Pickup #{$pickupRequest->id} completed",
            'cancelled' => "Pickup #{$pickupRequest->id} cancelled",
            default => "Pickup #{$pickupRequest->id} status → {$pickupRequest->status}",
        };

        ActivityLog::log(
            type: $type,
            description: $description,
            actor: $pickupRequest->user,
            metadata: [
                'pickup_request_id' => $pickupRequest->id,
                'route' => $pickupRequest->route?->name,
                'status' => $pickupRequest->status,
            ],
        );
    }
}
