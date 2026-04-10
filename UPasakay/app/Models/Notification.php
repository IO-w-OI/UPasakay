<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'message',
        'status',
        'target',
        'route_id',
        'scheduled_at',
        'sent_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function route()
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

    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function scheduleFor($dateTime)
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_at' => $dateTime,
        ]);

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'type',
        'target_route',
        'audience',
        'status',
        'scheduled_at',
        'sent_at',
        'failed_reason',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    /**
     * Get the type badge class for this notification
     */
    public function getTypeBadgeClass(): string
    {
        return match ($this->type) {
            'availability' => 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
            'delay' => 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
            'change' => 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
            'announcement' => 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
            default => 'bg-muted text-muted-foreground',
        };
    }

    /**
     * Get the type label
     */
    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'availability' => 'Shuttle Availability',
            'delay' => 'Route Delay',
            'change' => 'Route Change',
            'announcement' => 'Service Announcement',
            default => 'Unknown',
        };
    }

    /**
     * Format date/time for display
     */
    public function getFormattedTime(): string
    {
        $time = $this->sent_at ?? $this->scheduled_at ?? $this->created_at;
        return $time->format('h:i A');
    }

    /**
     * Get formatted date label
     */
    public function getFormattedDate(): string
    {
        $date = $this->sent_at ?? $this->scheduled_at ?? $this->created_at;

        if ($date->isToday()) {
            return 'Today';
        } elseif ($date->isYesterday()) {
            return 'Yesterday';
        } else {
            return $date->format('M d');
        }
    }

    /**
     * Get target route label
     */
    public function getTargetLabel(): string
    {
        return $this->target_route === 'all' ? 'All Routes' : $this->target_route;
    }

    /**
     * Scope: filter by type
     */
    public function scopeByType($query, $type)
    {
        if ($type && $type !== 'All') {
            return $query->where('type', $type);
        }
        return $query;
    }

    /**
     * Scope: filter by status
     */
    public function scopeByStatus($query, $status)
    {
        if ($status && $status !== 'All') {
            return $query->where('status', $status);
        }
        return $query;
    }

    /**
     * Scope: search by title or target
     */
    public function scopeSearch($query, $term)
    {
        if ($term) {
            return $query->where('title', 'like', "%{$term}%")
                ->orWhere('target_route', 'like', "%{$term}%");
        }
        return $query;
    }
}
