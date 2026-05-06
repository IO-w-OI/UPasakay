<?php

namespace App\Events;

use App\Models\PickupRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideAccepted implements ShouldBroadcast
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
        return [
            new Channel('passenger-'.$this->pickupRequest->passenger_id),
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

        return [
            'pickup_request_id' => $this->pickupRequest->id,
            'driver_id' => data_get($assignment, 'driver_id'),
            'driver_name' => data_get($assignment, 'driver.user.name'),
            'driver_rating' => data_get($assignment, 'driver.rating'),
            'shuttle_id' => data_get($assignment, 'shuttle_id'),
            'shuttle_number' => data_get($assignment, 'shuttle.shuttle_number'),
            'status' => 'accepted',
            'eta_minutes' => 5, // TODO: Calculate ETA
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
