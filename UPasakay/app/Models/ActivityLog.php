<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'type',
        'description',
        'actor_type',
        'actor_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * The actor (polymorphic: User, Driver, etc.) who caused the event.
     */
    public function actor()
    {
        return $this->morphTo();
    }

    /**
     * Helper: quickly log an activity.
     */
    public static function log(
        string $type,
        string $description,
        ?Model $actor = null,
        array $metadata = [],
    ): static {
        return static::create([
            'type' => $type,
            'description' => $description,
            'actor_type' => $actor ? get_class($actor) : null,
            'actor_id' => $actor?->getKey(),
            'metadata' => $metadata ?: null,
        ]);
    }

    /**
     * Map activity type to a frontend icon key.
     */
    public function getIconAttribute(): string
    {
        return match ($this->type) {
            'pickup_completed' => 'check',
            'pickup_cancelled' => 'x',
            'pickup_created', 'pickup_pending' => 'clock',
            'login' => 'user',
            'assignment_created' => 'bus',
            default => 'bell',
        };
    }
}
