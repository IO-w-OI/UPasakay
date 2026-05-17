<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

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

    public function getFormattedTime(): string
    {
        return ($this->sent_at ?? $this->created_at)->format('h:i A');
    }

    public function getFormattedDate(): string
    {
        $dt = $this->sent_at ?? $this->created_at;
        if ($dt->isToday()) return 'Today';
        if ($dt->isYesterday()) return 'Yesterday';
        return $dt->format('M d');
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
