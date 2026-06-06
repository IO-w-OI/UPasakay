<?php

namespace App\Events;

use App\Models\PickupRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PassengerBooked implements ShouldBroadcastNow
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
            new Channel('driver-requests'),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'pickup_request_id' => $this->pickupRequest->id,
            'passenger_id' => data_get($this->pickupRequest, 'user.passenger.id'),
            'passenger_name' => data_get($this->pickupRequest, 'user.name'),
            'passenger_phone' => data_get($this->pickupRequest, 'user.phone_number'),
            'pickup_latitude' => data_get($this->pickupRequest, 'pickupStop.latitude'),
            'pickup_longitude' => data_get($this->pickupRequest, 'pickupStop.longitude'),
            'dropoff_latitude' => data_get($this->pickupRequest, 'dropoffStop.latitude'),
            'dropoff_longitude' => data_get($this->pickupRequest, 'dropoffStop.longitude'),
            'status' => 'pending',
            'created_at' => $this->pickupRequest->created_at,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'passenger.booked';
    }
}
