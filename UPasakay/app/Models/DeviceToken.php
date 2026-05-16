<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'passenger_id',
        'expo_token',
        'platform',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(Passenger::class);
    }

    /**
     * Expo push tokens for a human, resolved from either the User row or its
     * linked Passenger row (a passenger may have registered under either).
     *
     * @return array<int, string>
     */
    public static function expoTokensForUser(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $passengerId = $user->passenger?->id;

        return static::query()
            ->where('user_id', $user->id)
            ->when($passengerId, fn ($q) => $q->orWhere('passenger_id', $passengerId))
            ->pluck('expo_token')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Expo push tokens for a set of user ids (used for driver fan-out).
     *
     * @param  array<int, int>  $userIds
     * @return array<int, string>
     */
    public static function expoTokensForUserIds(array $userIds): array
    {
        if (empty($userIds)) {
            return [];
        }

        return static::query()
            ->whereIn('user_id', $userIds)
            ->pluck('expo_token')
            ->unique()
            ->values()
            ->all();
    }
}
