<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShuttleLocationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $shuttleId,
        public readonly float $latitude,
        public readonly float $longitude,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('driver-tracking');
    }

    public function broadcastAs(): string
    {
        return 'LocationUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->shuttleId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
