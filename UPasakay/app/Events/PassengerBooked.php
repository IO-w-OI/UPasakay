<?php

namespace App\Events;

use App\Models\PickupRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PassengerBooked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public PickupRequest $pickupRequest,
    ) {
    }

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
            'passenger_id' => $this->pickupRequest->passenger_id,
            'passenger_name' => $this->pickupRequest->passenger?->user?->name,
            'passenger_phone' => $this->pickupRequest->passenger?->user?->phone_number,
            'pickup_latitude' => $this->pickupRequest->pickup_latitude,
            'pickup_longitude' => $this->pickupRequest->pickup_longitude,
            'dropoff_latitude' => $this->pickupRequest->dropoff_latitude,
            'dropoff_longitude' => $this->pickupRequest->dropoff_longitude,
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
