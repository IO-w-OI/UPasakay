<?php

namespace App\Models;

use App\Services\ExpoPushService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    /** Display timezone — timestamps are stored UTC, shown in Manila time. */
    public const DISPLAY_TZ = 'Asia/Manila';

    protected $fillable = [
        'title',
        'message',
        'type',
        'target',
        'target_route',
        'audience',
        'status',
        'route_id',
        'scheduled_at',
        'sent_at',
        'failed_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeReadyToSend($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<=', now());
    }

    /** The timestamp a row should be displayed against. */
    private function displayMoment()
    {
        if ($this->status === 'scheduled' && $this->scheduled_at) {
            return $this->scheduled_at;
        }
        return $this->sent_at ?? $this->created_at;
    }

    public function getFormattedTime(): string
    {
        return $this->displayMoment()
            ->copy()
            ->timezone(self::DISPLAY_TZ)
            ->format('h:i A');
    }

    public function getFormattedDate(): string
    {
        $dt = $this->displayMoment()->copy()->timezone(self::DISPLAY_TZ);
        $today = now()->timezone(self::DISPLAY_TZ);
        if ($dt->isSameDay($today)) return 'Today';
        if ($dt->isSameDay($today->copy()->subDay())) return 'Yesterday';
        return $dt->format('M d');
    }

    /**
     * Alert-type rows are written by the system itself (e.g. passenger
     * boarding events) — not composed by an admin. The admin UI uses this
     * to label them separately from manually-sent broadcasts.
     */
    public function isSystemGenerated(): bool
    {
        return $this->type === 'alert';
    }

    /**
     * Resolve the Expo push tokens for a given audience + target route.
     * audience: all | passengers | drivers. For drivers a specific route
     * narrows to the drivers currently on a shuttle for that route.
     *
     * @return array<int, string>
     */
    public static function recipientExpoTokens(string $audience = 'all', ?string $targetRoute = 'all'): array
    {
        $query = DeviceToken::query();

        if ($audience === 'passengers') {
            $userIds = Passenger::query()->whereNotNull('user_id')->pluck('user_id');
            $query->whereIn('user_id', $userIds);
        } elseif ($audience === 'drivers') {
            $driverQuery = Driver::query();
            if ($targetRoute && $targetRoute !== 'all') {
                $routeId = Route::where('name', $targetRoute)->value('id');
                $driverIds = $routeId
                    ? Shuttle::where('route_id', $routeId)->whereNotNull('driver_id')->pluck('driver_id')
                    : collect();
                $driverQuery->whereIn('id', $driverIds);
            }
            $userIds = $driverQuery->whereNotNull('user_id')->pluck('user_id');
            $query->whereIn('user_id', $userIds);
        }

        return $query->pluck('expo_token')->filter()->unique()->values()->all();
    }

    /**
     * Push this notification to its audience and stamp it sent. Centralises
     * the fan-out so immediate sends, the scheduled processor, and recurring
     * schedules all behave identically.
     */
    public function dispatchPush(): void
    {
        $tokens = self::recipientExpoTokens($this->audience ?? 'all', $this->target_route ?? 'all');
        if (! empty($tokens)) {
            (new ExpoPushService())->send(
                $tokens,
                $this->title,
                $this->message ?? '',
                ['type' => $this->type ?? 'announcement', 'notification_id' => $this->id],
            );
        }
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'availability' => 'Shuttle Availability',
            'delay'        => 'Route Delay',
            'change'       => 'Route Change',
            'announcement' => 'Service Announcement',
            'schedule'     => 'Schedule',
            'alert'        => 'Alert',
            default        => ucfirst($this->type),
        };
    }

    public function getTargetLabel(): string
    {
        $route = $this->target_route ?? $this->target ?? 'all';
        return $route === 'all' ? 'All Routes' : $route;
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function scheduleFor($dateTime): void
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_at' => $dateTime,
        ]);
    }
}
