<?php

namespace App\Http\Middleware;

use App\Models\Passenger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePassengerIsApproved
{
    /**
     * Ensure the authenticated passenger is active and verified for protected actions.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If the authenticated model is a Passenger (mobile token-based auth)
        if ($user instanceof Passenger) {
            return $this->authorizePassenger($request, $user, $next);
        }

        // If the authenticated model is a User (web session-based auth)
        if ($user && $user->passenger instanceof Passenger) {
            return $this->authorizePassenger($request, $user->passenger, $next);
        }

        return $next($request);
    }

    private function authorizePassenger(Request $request, Passenger $passenger, Closure $next): Response
    {
        // Keep legacy statuses for compatibility while enforcing unified values.
        $inactiveStatuses = ['inactive', 'blocked', 'pending', 'suspended', 'declined'];

        if ($passenger->passenger_status !== 'active' || in_array($passenger->passenger_status, $inactiveStatuses, true)) {
            return $this->deny(
                $request,
                'Your passenger account is not active.',
                [
                    'passenger_status' => $passenger->passenger_status,
                ]
            );
        }

        if ($passenger->verification_status !== 'approved') {
            return $this->deny(
                $request,
                'Your account is not yet verified.',
                [
                    'verification_status' => $passenger->verification_status,
                ]
            );
        }

        return $next($request);
    }

    private function deny(Request $request, string $message, array $extra = []): Response
    {
        if ($request->expectsJson()) {
            return response()->json(array_merge([
                'message' => $message,
            ], $extra), 403);
        }

        abort(403, $message);
    }
}
