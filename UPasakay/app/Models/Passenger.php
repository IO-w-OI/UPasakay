<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Passenger extends Model
{
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $fillable = [
        'user_id',
        'passenger_number',
        'department',
        'passenger_type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class, 'user_id', 'user_id');
    }
}