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
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
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
