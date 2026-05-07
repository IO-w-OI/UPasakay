<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickupRequest extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'route_id', 'pickup_stop_id', 'dropoff_stop_id', 'status', 'eta_minutes', 'assigned_at', 'completed_at'];

    /**
     * Scope: Filter only active pickup requests.
     * Active statuses: pending, accepted, in_progress
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['pending', 'accepted', 'in_progress']);
    }

    /**
     * Scope: Filter only completed or cancelled pickup requests.
     * Inactive statuses: completed, cancelled
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->whereIn('status', ['completed', 'cancelled']);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function pickupStop()
    {
        return $this->belongsTo(Stop::class, 'pickup_stop_id');
    }

    public function dropoffStop()
    {
        return $this->belongsTo(Stop::class, 'dropoff_stop_id');
    }

    public function assignment()
    {
        return $this->hasOne(DriverAssignment::class);
    }
}
