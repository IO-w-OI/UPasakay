<?php

namespace App\Http\Controllers\Api;

use App\Events\PassengerBoarded;
use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Models\Passenger;
use App\Models\PickupRequest;
use App\Models\ShuttleLocation;
use App\Services\ExpoPushService;
use App\Services\PickupRequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class PickupRequestController extends Controller
{
    /**
     * How close (metres) the passenger must be to the shuttle's last
     * reported GPS p
     * osition for a boarding confirmation to be accepted.
     */
    private const BOARDING_RADIUS_METERS = 60;

    /**
     * Reject the GPS guard if the shuttle hasn't reported a location within
     * this many minutes (stale/offline driver — can't verify presence).
     */
    private const SHUTTLE_GPS_MAX_AGE_MINUTES = 3;

    public function __construct(
        private PickupRequestService $pickupRequestService,
        private ExpoPushService $expoPush,
    ) {}

    public function index()
    {
        return response()->json(
            PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop'])->get()
        );
    }

    public function store(Request $request)
    {
        // Validate only the required fields for the mobile app and web requests
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'pickup_stop_id' => 'required|exists:stops,id',
            'dropoff_stop_id' => 'required|exists:stops,id',
        ]);

        // Get the authenticated user from the request token/session
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Mobile tokens authenticate as Passenger — resolve to the parent User
        if ($user instanceof \App\Models\Passenger) {
            $user = $user->user;
            if (! $user) {
                return response()->json(['message' => 'User account not found.'], 422);
            }
        }

        // Validate passenger status and check for duplicates
        try {
            $pickupRequest = $this->pickupRequestService->createPickupRequest($user, $validated);
            return response()->json($pickupRequest, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            error_log('[PickupRequest] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
    public function show(PickupRequest $pickupRequest)
    {
        return response()->json(
            $pickupRequest->load(['user', 'route', 'pickupStop', 'dropoffStop', 'assignment'])
        );
    }

    public function update(Request $request, PickupRequest $pickupRequest)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,accepted,in_progress,completed,cancelled',
            'assigned_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'cancel_reason' => 'nullable|string|max:500',
        ]);

        $pickupRequest->update($validated);

        return response()->json($pickupRequest);
    }

    public function destroy(PickupRequest $pickupRequest)
    {
        $pickupRequest->delete();

        return response()->json(['message' => 'Pickup request deleted successfully']);
    }

    /**
     * Passenger self-confirms boarding by scanning/typing the code printed
     * on the shuttle. Verifies the code matches the assigned shuttle AND the
     * passenger is physically near the shuttle's latest GPS position.
     */
    public function confirmBoarding(Request $request, PickupRequest $pickupRequest)
    {
        $user = $request->user();
        // pickup_requests.user_id references users.id; a Passenger token
        // carries its own PK (passengers.id), so resolve via user_id FK.
        $userId = $user instanceof Passenger ? $user->user_id : $user?->id;
        if (! $user || (int) $pickupRequest->user_id !== (int) $userId) {
            return response()->json(['message' => 'This is not your ride.'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        // Already boarded — tolerate a re-submit instead of erroring.
        if ($pickupRequest->status === 'in_progress') {
            return response()->json($pickupRequest->fresh());
        }

        if ($pickupRequest->status !== 'accepted') {
            return response()->json(['message' => 'This ride is not ready for boarding yet.'], 409);
        }

        $shuttle = $pickupRequest->assignment?->driver?->shuttle;
        if (! $shuttle) {
            return response()->json(['message' => 'No shuttle is assigned to this ride yet.'], 409);
        }

        if (! $shuttle->boarding_code) {
            return response()->json(['message' => 'This shuttle has no boarding code set yet.'], 409);
        }

        if (! hash_equals((string) $shuttle->boarding_code, strtoupper(trim($validated['code'])))) {
            return response()->json(['message' => 'Invalid boarding code.'], 422);
        }

        // GPS guard — the passenger must be near the shuttle's latest reported
        // position, so a correct code alone (e.g. from a photo) isn't enough.
        $latest = ShuttleLocation::where('shuttle_id', $shuttle->id)
            ->latest('recorded_at')
            ->first();

        $staleBefore = now()->subMinutes(self::SHUTTLE_GPS_MAX_AGE_MINUTES);
        if (! $latest || Carbon::parse($latest->recorded_at)->lt($staleBefore)) {
            return response()->json([
                'message' => "Can't verify your location — the driver's GPS hasn't updated recently. Make sure you're physically at the shuttle, then try again in a minute.",
            ], 422);
        }

        $meters = $this->distanceMeters(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            (float) $latest->latitude,
            (float) $latest->longitude,
        );

        if ($meters > self::BOARDING_RADIUS_METERS) {
            return response()->json([
                'message' => "You're too far from the shuttle to board. Get on the shuttle and try again.",
            ], 422);
        }

        $pickupRequest->update(['status' => 'in_progress', 'boarded_at' => now()]);
        if ($pickupRequest->assignment) {
            $pickupRequest->assignment->update(['status' => 'in_progress']);
        }

        broadcast(new PassengerBoarded($pickupRequest->fresh(['user.passenger'])));

        $tokens = DeviceToken::expoTokensForUser($pickupRequest->user);
        if (! empty($tokens)) {
            $this->expoPush->send(
                $tokens,
                "You're on board",
                'Enjoy your ride with UPasakay!',
                ['type' => 'passenger_boarded', 'pickup_request_id' => $pickupRequest->id],
            );
        }

        $this->pickupRequestService->logDriverNotification(
            $pickupRequest->fresh(['user', 'pickupStop']),
            ($pickupRequest->user?->full_name ?? 'Passenger').' boarded.'
        );

        return response()->json($pickupRequest->fresh());
    }

    /**
     * Passenger rates a completed ride. One rating per ride — a request that
     * already has a rating is rejected so a driver's average can't be inflated
     * by replaying this endpoint.
     */
    public function feedback(Request $request, PickupRequest $pickupRequest)
    {
        $principal = $request->user();
        if (! $principal) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // pickup_requests.user_id references users.id; a Passenger token
        // carries user_id, a User principal carries its own id.
        $userId = $principal instanceof Passenger ? $principal->user_id : $principal->id;

        if ((int) $pickupRequest->user_id !== (int) $userId) {
            return response()->json(['message' => 'This is not your ride.'], 403);
        }

        if ($pickupRequest->status !== 'completed') {
            return response()->json(['message' => 'You can only rate a completed ride.'], 422);
        }

        if (! is_null($pickupRequest->rating)) {
            return response()->json(['message' => 'You have already rated this ride.'], 422);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $pickupRequest->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($pickupRequest->fresh());
    }

    /**
     * Great-circle distance in metres (Haversine).
     */
    private function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6_371_000; // metres
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
