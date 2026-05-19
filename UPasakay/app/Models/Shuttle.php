<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shuttle extends Model
{
    use HasFactory;

    protected $fillable = [
        'shuttle_code',
        'boarding_code',
        'shuttle_type',
        'plate_number',
        'capacity',
        'is_active',
        'status',
        'route_id',
        'driver_id',
        'last_seen_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_seen_at' => 'datetime',
    ];

    public function locations()
    {
        return $this->hasMany(ShuttleLocation::class);
    }

    public function latestLocation()
    {
        return $this->hasOne(ShuttleLocation::class)->latestOfMany('recorded_at');
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Collision-free uppercase 6-character boarding code (no ambiguous
     * 0/O/1/I) — short enough to print large and type by hand.
     */
    public static function generateUniqueBoardingCode(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        do {
            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
        } while (static::where('boarding_code', $code)->exists());

        return $code;
    }
}
