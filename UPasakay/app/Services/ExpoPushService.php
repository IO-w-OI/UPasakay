<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    private const ENDPOINT = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send a push notification to a list of Expo push tokens.
     *
     * Covers both FCM (Android) and APNs (iOS) via Expo's relay and works in
     * Expo Go for development. Failures are logged and swallowed so a push
     * problem never breaks the request that triggered it.
     *
     * @param  array<int, string>  $tokens  Expo push tokens
     * @param  array<string, mixed>  $data   Arbitrary payload read by the app
     */
    public function send(array $tokens, string $title, string $body, array $data = []): void
    {
        $tokens = array_values(array_unique(array_filter(
            $tokens,
            fn ($t) => is_string($t) && str_starts_with($t, 'ExponentPushToken')
        )));

        if (empty($tokens)) {
            return;
        }

        // Expo accepts up to 100 messages per request.
        foreach (array_chunk($tokens, 100) as $chunk) {
            $messages = array_map(fn ($to) => [
                'to' => $to,
                'title' => $title,
                'body' => $body,
                'sound' => 'default',
                'data' => $data,
            ], $chunk);

            try {
                $response = Http::acceptJson()
                    ->asJson()
                    ->timeout(15)
                    ->post(self::ENDPOINT, $messages);

                if ($response->failed()) {
                    Log::warning('Expo push send failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Expo push send threw', ['error' => $e->getMessage()]);
            }
        }
    }
}
