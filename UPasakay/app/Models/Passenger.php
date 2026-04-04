<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Passenger extends Model
{
    protected $fillable = [
        'user_id',
        'passenger_number',
        'department',
        'passenger_type',
        'passenger_status',
        'proof_document_path',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class, 'user_id', 'user_id');
    }
}