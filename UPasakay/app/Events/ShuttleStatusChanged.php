<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a shuttle's availability changes without a new GPS fix —
 * e.g. the driver toggles off duty. The live map uses this to drop the
 * marker immediately instead of waiting for it to go stale.
 */
class ShuttleStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $shuttleId,
        public readonly string $status,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('shuttle-locations');
    }

    public function broadcastAs(): string
    {
        return 'shuttle.status';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->shuttleId,
            'status' => $this->status,
        ];
    }
}
