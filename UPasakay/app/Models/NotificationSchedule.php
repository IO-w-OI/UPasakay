<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSchedule extends Model
{
    protected $table = 'notification_schedules';

    protected $fillable = [
        'name',
        'title',
        'message',
        'type',
        'target_route',
        'audience',
        'frequency',
        'time',
        'is_active',
        'last_sent_on',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_sent_on' => 'date',
        ];
    }

    /**
     * Whether this schedule is due to fire now (Manila time): active, its
     * frequency covers today, its time-of-day has passed, and it hasn't
     * already fired today.
     */
    public function isDueNow(\Carbon\Carbon $nowManila): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->last_sent_on && $this->last_sent_on->isSameDay($nowManila)) {
            return false;
        }

        $isWeekday = $nowManila->isWeekday();
        $frequencyMatches = match ($this->frequency) {
            'daily', 'custom' => true,
            'weekdays' => $isWeekday,
            'weekends' => ! $isWeekday,
            default => false,
        };
        if (! $frequencyMatches) {
            return false;
        }

        // time column is stored "HH:MM" or "HH:MM:SS".
        return $nowManila->format('H:i') >= substr((string) $this->time, 0, 5);
    }

    /**
     * Get the frequency label for display
     */
    public function getFrequencyLabel(): string
    {
        return match ($this->frequency) {
            'daily' => 'Every day',
            'weekdays' => 'Weekdays',
            'weekends' => 'Weekends',
            'custom' => 'Custom days',
            default => 'Unknown',
        };
    }

    /**
     * Get full schedule display (e.g., "Every day 6:00 AM")
     */
    public function getScheduleDisplay(): string
    {
        $freqLabel = $this->getFrequencyLabel();
        $timeFormatted = date('g:i A', strtotime($this->time));

        return "{$freqLabel} {$timeFormatted}";
    }

    /**
     * Get target route label
     */
    public function getTargetLabel(): string
    {
        return $this->target_route === 'all' ? 'All Routes' : $this->target_route;
    }

    /**
     * Scope: active schedules only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Toggle active status
     */
    public function toggleActive()
    {
        $this->update(['is_active' => ! $this->is_active]);

        return $this;
    }
}
