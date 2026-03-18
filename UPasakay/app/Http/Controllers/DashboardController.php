<?php

namespace App\Http\Controllers;

use App\Models\Driver;
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

        // ── Shuttle status overview ───────────────────────────────────────────
        $shuttles = Shuttle::with(['route', 'driver'])
            ->orderBy('shuttle_code')
            ->get()
            ->map(fn($s) => [
                'shuttle_code' => $s->shuttle_code,
                'driver' => $s->driver?->full_name ?? '—',
                'route' => $s->route?->name ?? '—',
                'status' => $s->status,
                'last_seen' => $s->last_seen_at
                    ? $s->last_seen_at->diffForHumans(null, true) . ' ago'
                    : '—',
            ]);

        // ── Pickups per route ─────────────────────────────────────────────────
        $pickupsPerRoute = Route::withCount([
            'pickupRequests as pickups_count' => fn($q) => $q->whereIn('status', ['completed', 'pending']),
        ])
            ->orderByDesc('pickups_count')
            ->get()
            ->map(fn($r) => [
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

        // ── Recent activity (last 5 events) ──────────────────────────────────
        $recentRequests = PickupRequest::with(['route', 'user'])
            ->whereIn('status', ['completed', 'pending', 'cancelled'])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'icon' => match ($r->status) {
                    'completed' => 'check',
                    'cancelled' => 'x',
                    default => 'clock',
                },
                'text' => match ($r->status) {
                    'completed' => "Pickup #{$r->id} completed",
                    'cancelled' => "Pickup #{$r->id} cancelled",
                    default => "Pickup Req #{$r->id} — {$r->user?->email}",
                },
                'time' => Carbon::parse($r->updated_at)->format('h:i A'),
            ]);

        // Merge a couple of static system events at the top
        $recentActivity = collect([
            ['icon' => 'bus', 'text' => 'Shuttle SH-001 started South Route', 'time' => '08:30 AM'],
            ['icon' => 'user', 'text' => 'Driver D. Cruz logged in', 'time' => '08:28 AM'],
            ['icon' => 'bell', 'text' => 'Announcement sent — All routes', 'time' => '08:00 AM'],
        ])->merge($recentRequests)->take(6);

        $notifications = collect([
            ['icon' => 'bell', 'text' => 'Schedule update: South Route delayed by 15 mins', 'time' => '09:15 AM'],
            ['icon' => 'bus', 'text' => 'Shuttle SH-003 maintenance reminder', 'time' => '08:45 AM'],
            ['icon' => 'clock', 'text' => 'Peak hour starts in 30 minutes', 'time' => '08:30 AM'],
            ['icon' => 'user', 'text' => 'New driver assignment: J. Reyes → North Route', 'time' => '08:15 AM'],
            ['icon' => 'bell', 'text' => 'System backup completed successfully', 'time' => '07:00 AM'],
        ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'activeShuttles' => $activeShuttles,
                'driversOnline' => $driversOnline,
                'pendingRequests' => $pendingRequests,
                'avgFeedback' => '4.2 / 5',
            ],
            'shuttles' => $shuttles,
            'pickupsPerRoute' => $pickupsPerRoute,
            'maxPickups' => $maxPickups,
            'successPct' => $successPct,
            'failedPct' => $failedPct,
            'recentActivity' => $recentActivity,
            'notifications' => $notifications,
        ]);
    }
}
