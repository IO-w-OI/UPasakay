<?php

namespace App\Events;

use App\Models\PickupRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PassengerBoarded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public PickupRequest $pickupRequest,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * Mirrors RideAccepted's derivation — PickupRequest has no passenger_id
     * column, so the passenger channel is keyed off the related passenger id
     * (falling back to user_id), matching the app's subscription.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $passengerId = $this->pickupRequest->user?->passenger?->id;

        $channelId = $passengerId ?? $this->pickupRequest->user_id;

        return [
            new Channel('passenger-'.$channelId),
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
            'status' => 'in_progress',
            'boarded_at' => $this->pickupRequest->boarded_at,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'passenger.boarded';
    }
}
