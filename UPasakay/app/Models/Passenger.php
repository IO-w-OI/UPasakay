<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Passenger extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'password_hash',
        'passenger_number',
        'department',
        'passenger_type',
        'passenger_status',
        'proof_document_path',
        'reviewed_at',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
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