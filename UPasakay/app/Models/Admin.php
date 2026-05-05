<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    /** @use HasFactory<\Database\Factories\AdminFactory> */
    use HasFactory;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $fillable = ['user_id', 'access_level'];

    protected $casts = [
        'access_level' => 'integer',
    ];

    /**
     * Get the user associated with this admin account.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Check if this admin is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->access_level === 2;
    }

    /**
     * Check if this admin is a regular admin.
     */
    public function isRegularAdmin(): bool
    {
        return $this->access_level === 1;
    }
}
