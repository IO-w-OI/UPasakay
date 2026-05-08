<?php

namespace App\Events;

use App\Models\PickupRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideAccepted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public PickupRequest $pickupRequest,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $passengerId = $this->pickupRequest->user?->passenger?->id;

        $channelId = $passengerId ?? $this->pickupRequest->user_id;

        return [
            new Channel('passenger-'.$channelId),
            new Channel('admin-rides'),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $assignment = data_get($this->pickupRequest, 'assignment');
        $driver = data_get($assignment, 'driver');

        return [
            'pickup_request_id' => $this->pickupRequest->id,
            'driver_id' => data_get($assignment, 'driver_id'),
            'driver_name' => data_get($driver, 'user.name')
                ?? data_get($driver, 'full_name'),
            'driver_rating' => data_get($driver, 'rating'),
            'shuttle_id' => data_get($driver, 'shuttle.id'),
            'shuttle_number' => data_get($driver, 'shuttle.shuttle_code'),
            'status' => 'accepted',
            'eta_minutes' => $this->pickupRequest->eta_minutes,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ride.accepted';
    }
}
