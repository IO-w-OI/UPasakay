<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Route;
use App\Models\Shuttle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $routes = Route::where('is_active', true)->pluck('name');

        // Feedback now combines two signals admins care about:
        //  · Completed rides with a passenger rating + comment, AND
        //  · Cancellations where the passenger gave a reason.
        // Showing both means admins see *what passengers said* in either case,
        // not just completed-ride ratings (which is rare in early testing).
        $query = PickupRequest::with(['user', 'route'])
            ->where(function ($q) {
                $q->where('status', 'completed')
                    ->orWhere(function ($qq) {
                        $qq->where('status', 'cancelled')->whereNotNull('cancel_reason');
                    });
            })
            ->latest();

        // Time range filter
        if ($request->filled('range')) {
            $days = match ($request->range) {
                '7' => 7,
                '30' => 30,
                'month' => Carbon::now()->day,
                default => null,
            };
            if ($days) {
                $query->where('created_at', '>=', Carbon::now()->subDays($days));
            }
        }

        // Route filter for reports
        $reportRouteFilter = $request->input('reportRoute');

        $feedbackRows = $query->take(50)->get();

        $completedCount = $feedbackRows->where('status', 'completed')->count();

        $total = $feedbackRows->count();

        $requestTable = (new PickupRequest())->getTable();
        $hasRatingColumn = Schema::hasColumn($requestTable, 'rating');
        $avgRating = $hasRatingColumn
            ? round((float) (PickupRequest::query()->whereNotNull('rating')->avg('rating') ?? 0), 1)
            : 0;

        $allRequests = PickupRequest::whereIn('status', ['completed', 'cancelled'])->count();
        if ($allRequests === 0) {
            $boardedPct = 0;
            $failedPct = 0;
        } else {
            $boardedPct = round(($completedCount / $allRequests) * 100);
            $failedPct = 100 - $boardedPct;
        }

        $feedback = $feedbackRows->take(20)->values()->map(function ($r) {
            $isCompleted = $r->status === 'completed';

            return [
                'id' => $r->id,
                'passenger' => $r->user?->full_name ?? $r->user?->email ?? 'Passenger',
                'rating' => $isCompleted ? (int) ($r->rating ?? 0) : 0,
                // For cancellations the cancel_reason IS the feedback the
                // passenger gave; surface it in the same column so admins
                // can scan rationale at a glance.
                'comment' => $isCompleted
                    ? ($r->comment ?? '')
                    : ($r->cancel_reason ?? ''),
                'route' => $r->route?->name ?? '—',
                'status' => $isCompleted ? 'boarded' : 'cancelled',
                'date' => Carbon::parse($r->created_at)->timezone('Asia/Manila')->format('M j'),
                'replied' => (bool) ($r->replied ?? false),
            ];
        })->all();

        // Daily pickups chart (respecting time range)
        $rangeDays = 7;
        if ($request->filled('range')) {
            $rangeDays = match ($request->range) {
                '7' => 7,
                '30' => 30,
                'month' => Carbon::now()->day,
                default => 7,
            };
        }

        $dailyPickups = collect(range($rangeDays - 1, 0))->map(function ($daysAgo) use ($reportRouteFilter) {
            $date = Carbon::today()->subDays($daysAgo);
            $q = PickupRequest::whereDate('created_at', $date)->where('status', 'completed');
            if ($reportRouteFilter && $reportRouteFilter !== 'All') {
                $q->whereHas('route', fn ($rq) => $rq->where('name', $reportRouteFilter));
            }

            return [
                'label' => $date->format('M j'),
                'count' => $q->count(),
            ];
        });

        // Route performance (respecting route filter)
        $rpQuery = Route::withCount([
            'pickupRequests as pickups_count' => function ($q) use ($rangeDays) {
                $q->where('status', 'completed');
                if ($rangeDays) {
                    $q->where('created_at', '>=', Carbon::now()->subDays($rangeDays));
                }
            },
        ]);

        if ($reportRouteFilter && $reportRouteFilter !== 'All') {
            $rpQuery->where('name', $reportRouteFilter);
        }

        $routePerformance = $rpQuery->get()->map(fn ($r) => [
            'name' => $r->name,
            'count' => $r->pickups_count,
        ]);

        // Real shuttle activity from DB
        $shuttleActivity = Shuttle::with(['driver', 'route'])
            ->whereNotNull('driver_id')
            ->get()
            ->flatMap(function ($shuttle) use ($rangeDays) {
                $dates = collect(range(0, min($rangeDays - 1, 3)))->map(fn ($d) => Carbon::today()->subDays($d));

                return $dates->map(function ($date) use ($shuttle) {
                    $pickups = PickupRequest::where('route_id', $shuttle->route_id)
                        ->whereDate('created_at', $date)
                        ->where('status', 'completed')
                        ->count();
                    if ($pickups === 0) {
                        return null;
                    }

                    return [
                        'date' => $date->format('M j'),
                        'shuttle' => $shuttle->shuttle_code,
                        'driver' => $shuttle->driver?->full_name ? mb_substr($shuttle->driver->full_name, 0, 1).'. '.explode(' ', $shuttle->driver->full_name)[1] ?? '' : '—',
                        'route' => $shuttle->route?->name ?? '—',
                        'start' => '05:30',
                        'end' => $date->isToday() ? '—' : '17:00',
                        'pickups' => $pickups,
                    ];
                })->filter();
            })->values();

        return Inertia::render('Feedback/Index', [
            'routes' => $routes,
            'feedback' => $feedback,
            'stats' => [
                'total' => $total,
                'avgRating' => $avgRating,
                'boardedPct' => $boardedPct,
                'failedPct' => $failedPct,
            ],
            'dailyPickups' => $dailyPickups,
            'routePerformance' => $routePerformance,
            'shuttleActivity' => $shuttleActivity,
            'filters' => $request->only(['range', 'reportRoute']),
        ]);
    }
}
