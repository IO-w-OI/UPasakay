<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $fillable = ['name', 'start_location', 'end_location', 'distance_km', 'estimated_duration_minutes', 'is_active'];

    public function stops()
    {
        return $this->hasMany(Stop::class)->orderBy('sequence', 'asc');
    }
    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class);
    }
}