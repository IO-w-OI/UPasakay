<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Shuttle extends Model
{
    protected $fillable = ['plate_number', 'capacity', 'is_active'];

    public function locations()
    {
        return $this->hasMany(ShuttleLocation::class);
    }
}