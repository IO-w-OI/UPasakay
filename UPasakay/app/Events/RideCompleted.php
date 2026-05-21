<?php

namespace App\Events;

use App\Models\PickupRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideCompleted implements ShouldBroadcastNow
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
        $passengerId = $this->pickupRequest->user?->passenger?->id
            ?? $this->pickupRequest->user_id;

        return [
            new Channel('passenger-'.$passengerId),
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
        $driver = $this->pickupRequest->assignment?->driver;

        return [
            'pickup_request_id' => $this->pickupRequest->id,
            'status' => 'completed',
            'completed_at' => now(),
            'driver_name' => $driver?->user?->name ?? $driver?->full_name ?? null,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ride.completed';
    }
}
