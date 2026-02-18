<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PickupRequest extends Model
{
    protected $fillable = ['user_id', 'route_id', 'pickup_stop_id', 'dropoff_stop_id', 'status', 'assigned_at', 'completed_at'];

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