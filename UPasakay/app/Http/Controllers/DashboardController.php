<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Driver;
use App\Models\Passenger;
use App\Models\PickupRequest;
use App\Models\Route;
use App\Models\Shuttle;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ── Stats cards ──────────────────────────────────────────────────────
        $activeShuttles = Shuttle::where('status', 'active')->count();
        $driversOnline = Driver::where('is_available', true)->count();
        $pendingRequests = PickupRequest::where('status', 'pending')->count();
        $pendingApprovals = Passenger::where('passenger_status', 'pending')->count();

        // ── Shuttle status overview ───────────────────────────────────────────
        $shuttles = Shuttle::with(['route', 'driver'])
            ->orderBy('shuttle_code')
            ->get()
            ->map(fn ($s) => [
                'shuttle_code' => $s->shuttle_code,
                'driver' => $s->driver?->full_name ?? '—',
                'route' => $s->route?->name ?? '—',
                'status' => $s->status,
                'last_seen' => $s->last_seen_at
                    ? $s->last_seen_at->diffForHumans(null, true).' ago'
                    : '—',
            ]);

        // ── Pickups per route ─────────────────────────────────────────────────
        $pickupsPerRoute = Route::withCount([
            'pickupRequests as pickups_count' => fn ($q) => $q->whereIn('status', ['completed', 'pending']),
        ])
            ->orderByDesc('pickups_count')
            ->get()
            ->map(fn ($r) => [
                'name' => $r->name,
                'count' => $r->pickups_count,
            ]);

        $maxPickups = $pickupsPerRoute->max('count') ?: 1;

        // ── Boarding success rate ─────────────────────────────────────────────
        $completed = PickupRequest::where('status', 'completed')->count();
        $cancelled = PickupRequest::where('status', 'cancelled')->count();
        $total = $completed + $cancelled ?: 1;
        $successPct = round(($completed / $total) * 100);
        $failedPct = 100 - $successPct;

        // ── Recent activity (fully dynamic from activity_logs) ───────────────
        $recentActivity = ActivityLog::query()
            ->latest('created_at')
            ->take(6)
            ->get()
            ->map(fn ($activity) => [
                'icon' => $activity->icon,
                'text' => $activity->description,
                'time' => Carbon::parse($activity->created_at)->format('h:i A'),
            ]);

        $notifications = collect([
            ['icon' => 'bell', 'text' => 'Schedule update: South Route delayed by 15 mins', 'time' => '09:15 AM'],
            ['icon' => 'bus', 'text' => 'Shuttle SH-003 maintenance reminder', 'time' => '08:45 AM'],
            ['icon' => 'clock', 'text' => 'Peak hour starts in 30 minutes', 'time' => '08:30 AM'],
            ['icon' => 'user', 'text' => 'New driver assignment: J. Reyes → North Route', 'time' => '08:15 AM'],
            ['icon' => 'bell', 'text' => 'System backup completed successfully', 'time' => '07:00 AM'],
        ]);

        $pendingPickupAttention = PickupRequest::with(['user', 'route'])
            ->where('status', 'pending')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($r) => [
                'icon' => 'clock',
                'type' => 'Pickup',
                'text' => "Pickup #{$r->id} pending — {$r->user?->email}",
                'time' => Carbon::parse($r->created_at)->diffForHumans(),
                'href' => '/pickup-requests?status=pending',
                'timestamp' => Carbon::parse($r->created_at)->timestamp,
            ]);

        $pendingPassengerAttention = Passenger::with('user')
            ->where('passenger_status', 'pending')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($p) => [
                'icon' => 'user',
                'type' => 'Passenger Approval',
                'text' => 'Approval needed — '.($p->user?->email ?? "Passenger #{$p->id}"),
                'time' => Carbon::parse($p->created_at)->diffForHumans(),
                'href' => '/passengers?tab=pending',
                'timestamp' => Carbon::parse($p->created_at)->timestamp,
            ]);

        // Use a base collection: Eloquent\Collection::map() stays an
        // Eloquent collection when the source is empty, and its merge()
        // calls getKey() on each item — fatal when items are arrays.
        $needsAttention = collect($pendingPickupAttention)
            ->merge($pendingPassengerAttention)
            ->sortByDesc('timestamp')
            ->take(8)
            ->values()
            ->map(fn ($item) => collect($item)->except('timestamp')->all());

        return Inertia::render('Dashboard', [
            'stats' => [
                'activeShuttles' => $activeShuttles,
                'driversOnline' => $driversOnline,
                'pendingRequests' => $pendingRequests,
                'pendingApprovals' => $pendingApprovals,
                'avgFeedback' => '4.2 / 5',
            ],
            'shuttles' => $shuttles,
            'pickupsPerRoute' => $pickupsPerRoute,
            'maxPickups' => $maxPickups,
            'successPct' => $successPct,
            'failedPct' => $failedPct,
            'recentActivity' => $recentActivity,
            'notifications' => $notifications,
            'needsAttention' => $needsAttention,
        ]);
    }
}
