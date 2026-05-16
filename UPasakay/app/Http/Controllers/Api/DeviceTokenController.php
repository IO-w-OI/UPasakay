<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Models\Passenger;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Register (or re-point) an Expo push token for the authenticated principal.
     *
     * Keyed on expo_token via updateOrCreate: Expo tokens rotate when the app
     * is reinstalled or its data cleared, and the same token can move between
     * accounts, so this must never throw a unique-constraint error.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expo_token' => ['required', 'string'],
            'platform' => ['nullable', 'string', 'in:ios,android'],
        ]);

        [$userId, $passengerId] = $this->resolveOwner($request->user());

        $deviceToken = DeviceToken::updateOrCreate(
            ['expo_token' => $validated['expo_token']],
            [
                'user_id' => $userId,
                'passenger_id' => $passengerId,
                'platform' => $validated['platform'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Device token registered',
            'data' => $deviceToken,
        ], 200);
    }

    /**
     * Remove a device token (called on logout / push opt-out).
     */
    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expo_token' => ['required', 'string'],
        ]);

        DeviceToken::where('expo_token', $validated['expo_token'])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Device token removed',
        ], 200);
    }

    /**
     * Map the Sanctum principal (a User or a Passenger) to anchor ids.
     *
     * @return array{0: ?int, 1: ?int}  [user_id, passenger_id]
     */
    private function resolveOwner(mixed $principal): array
    {
        if ($principal instanceof Passenger) {
            return [$principal->user_id, $principal->id];
        }

        if ($principal instanceof User) {
            return [$principal->id, $principal->passenger?->id];
        }

        return [null, null];
    }
}
