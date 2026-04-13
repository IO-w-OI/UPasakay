<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePassengerIsApproved
{
    /**
     * Ensure the authenticated user's passenger profile has been approved by an admin.
     *
     * This blocks passengers with 'pending', 'suspended', or 'declined' status
     * from accessing protected features like creating pickup requests.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If the authenticated model is a Passenger (mobile token-based auth)
        if ($user instanceof \App\Models\Passenger) {
            if ($user->passenger_status !== 'active') {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Your account is pending admin approval.',
                        'status' => $user->passenger_status,
                    ], 403);
                }

                abort(403, 'Your account is pending admin approval.');
            }

            return $next($request);
        }

        // If the authenticated model is a User (web session-based auth)
        if ($user && $user->passenger && $user->passenger->passenger_status !== 'active') {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your account is pending admin approval.',
                    'status' => $user->passenger->passenger_status,
                ], 403);
            }

            abort(403, 'Your account is pending admin approval.');
        }

        return $next($request);
    }
}
