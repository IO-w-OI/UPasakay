<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shuttle extends Model
{
    use HasFactory;

    protected $fillable = [
        'shuttle_code',
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

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}