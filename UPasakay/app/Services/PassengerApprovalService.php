<?php

namespace App\Services;

use App\Mail\PassengerApproved;
use App\Models\DeviceToken;
use App\Models\Passenger;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PassengerApprovalService
{
    public function __construct(
        private ExpoPushService $expoPush,
    ) {}

    /**
     * Apply an admin status decision to a passenger and keep verification_status
     * in sync so the approval-gated API middleware behaves consistently.
     *
     * When a passenger transitions into the approved ("active") state from any
     * other state, they are notified via push + email.
     */
    public function setStatus(Passenger $passenger, string $status): void
    {
        $wasApproved = $passenger->passenger_status === 'active';

        $passenger->update([
            'passenger_status' => $status,
            'verification_status' => $this->verificationFor($status),
            'reviewed_at' => $status === 'pending' ? null : now(),
        ]);

        if ($status === 'active' && ! $wasApproved) {
            $this->notifyApproved($passenger);
        }
    }

    /**
     * Apply a status decision to many passengers at once (bulk admin action).
     *
     * @param  array<int, int>  $ids
     */
    public function bulkSetStatus(array $ids, string $status): void
    {
        Passenger::whereIn('id', $ids)->get()->each(
            fn (Passenger $passenger) => $this->setStatus($passenger, $status)
        );
    }

    /**
     * verification_status is a strict enum (pending|approved|rejected); map the
     * admin-facing passenger_status onto it.
     */
    private function verificationFor(string $status): string
    {
        return match ($status) {
            'active' => 'approved',
            'suspended', 'declined' => 'rejected',
            default => 'pending',
        };
    }

    /**
     * Tell the passenger their account is live. Push is best-effort (the
     * passenger may not have a device token yet); email is the reliable channel.
     */
    private function notifyApproved(Passenger $passenger): void
    {
        $tokens = DeviceToken::expoTokensForUser($passenger->user);
        if (! empty($tokens)) {
            $this->expoPush->send(
                $tokens,
                'Account approved',
                'Your UPasakay account has been approved. You can now book rides!',
                ['type' => 'account_approved'],
            );
        }

        if ($passenger->email) {
            try {
                Mail::to($passenger->email)->send(new PassengerApproved($passenger));
            } catch (\Throwable $e) {
                // Never let a mail transport failure roll back an approval.
                Log::warning('Passenger approval email failed', [
                    'passenger_id' => $passenger->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
