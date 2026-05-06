<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverAssignment extends Model
{
    use HasFactory;

    protected $fillable = ['driver_id', 'pickup_request_id', 'status', 'assigned_at'];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    public function pickupRequest()
    {
        return $this->belongsTo(PickupRequest::class);
    }
}
