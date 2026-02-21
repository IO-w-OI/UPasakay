<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ShuttleLocation extends Model
{
    protected $fillable = ['shuttle_id', 'latitude', 'longitude', 'speed_kmh', 'recorded_at'];

    public function shuttle()
    {
        return $this->belongsTo(Shuttle::class);
    }
}