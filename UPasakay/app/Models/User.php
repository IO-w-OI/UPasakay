<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password_hash',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The column used for authentication password.
     */
    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function passenger()
    {
        return $this->hasOne(Passenger::class);
    }

    /**
     * Get the admin account associated with this user.
     */
    public function admin(): ?Admin
    {
        return $this->adminRelation()->first();
    }

    /**
     * Relationship builder for the user's admin account.
     */
    public function adminRelation(): HasOne
    {
        return $this->hasOne(Admin::class);
    }

    /**
     * Provide property-style access for `$user->admin`.
     */
    public function getAdminAttribute(): ?Admin
    {
        return $this->admin();
    }

    public function driver(): HasOne
    {
        return $this->hasOne(Driver::class);
    }
}
