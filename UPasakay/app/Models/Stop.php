<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Stop extends Model
{
    protected $fillable = ['route_id', 'name', 'latitude', 'longitude', 'is_active'];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}