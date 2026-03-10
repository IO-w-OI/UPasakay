<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = ['user_id', 'full_name', 'license_number', 'is_available'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function assignments()
    {
        return $this->hasMany(DriverAssignment::class, 'driver_id', 'user_id');
    }
}