<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'full_name', 'license_number', 'is_available', 'driver_status', 'is_suspended'];

    protected $casts = [
        'is_available' => 'boolean',
        'is_suspended' => 'boolean',
    ];

    /**
     * The status surfaced to admin (web) and driver (mobile) alike.
     * Suspension is an admin override; otherwise it's the driver's own
     * duty state. Keeps the value uniform across both apps.
     */
    public function displayStatus(): string
    {
        if ($this->is_suspended) {
            return 'suspended';
        }

        return $this->driver_status ?? ($this->is_available ? 'active' : 'offline');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignments()
    {
        return $this->hasMany(DriverAssignment::class, 'driver_id');
    }

    public function shuttle()
    {
        return $this->hasOne(Shuttle::class);
    }
}
