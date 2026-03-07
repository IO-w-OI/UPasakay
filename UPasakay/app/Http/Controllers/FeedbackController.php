<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Route;
use Carbon\Carbon;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function index()
    {
        $routes = Route::where('is_active', true)->pluck('name');

        // Build feedback from completed pickup requests as proxy
        $completed = PickupRequest::with(['user', 'route'])
            ->where('status', 'completed')
            ->latest()
            ->take(50)
            ->get();

        $total    = $completed->count();
        $avgRating = 4.2;

        $allRequests = PickupRequest::whereIn('status', ['completed', 'cancelled'])->count() ?: 1;
        $boardedPct  = $total > 0 ? round(($completed->count() / $allRequests) * 100) : 0;
        $failedPct   = 100 - $boardedPct;

        // Mock feedback (replace with real Feedback model when available)
        $feedback = collect([
            [
                'id'       => 1, 'passenger' => 'Juan Santos',  'rating' => 5,
                'comment'  => 'Very punctual!',
                'status'   => 'boarded', 'date' => 'Today', 'replied' => false,
            ],
            [
                'id'       => 2, 'passenger' => 'Maria Lim',    'rating' => 3,
                'comment'  => 'Driver was friendly but shuttle was late.',
                'status'   => 'boarded', 'date' => 'Today', 'replied' => false,
            ],
            [
                'id'       => 3, 'passenger' => 'Carlo Bato',   'rating' => 2,
                'comment'  => 'Missed shuttle, app notification was late.',
                'status'   => 'failed',  'date' => 'Today', 'replied' => false,
            ],
        ]);

        // System reports — daily pickups per day for the last 7 days
        $dailyPickups = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            return [
                'label' => $date->format('D'),
                'count' => PickupRequest::whereDate('created_at', $date)
                    ->where('status', 'completed')->count(),
            ];
        });

        $routePerformance = Route::withCount([
            'pickupRequests as pickups_count' => fn($q) => $q->where('status', 'completed'),
        ])->get()->map(fn($r) => [
            'name'  => $r->name,
            'count' => $r->pickups_count,
        ]);

        $shuttleActivity = collect([
            ['date' => 'Mar 4', 'shuttle' => 'SH-001', 'driver' => 'J. Cruz',   'route' => 'South',   'start' => '08:28', 'end' => '—',   'pickups' => 7],
            ['date' => 'Mar 4', 'shuttle' => 'SH-002', 'driver' => 'M. Reyes',  'route' => 'North',   'start' => '07:55', 'end' => '—',   'pickups' => 5],
            ['date' => 'Mar 3', 'shuttle' => 'SH-001', 'driver' => 'J. Cruz',   'route' => 'South',   'start' => '08:10', 'end' => '17:30', 'pickups' => 23],
            ['date' => 'Mar 3', 'shuttle' => 'SH-003', 'driver' => 'P. Santos', 'route' => 'Cebu City', 'start' => '08:00', 'end' => '17:00', 'pickups' => 18],
        ]);

        return Inertia::render('Feedback/Index', [
            'routes'           => $routes,
            'feedback'         => $feedback,
            'stats' => [
                'total'      => $total,
                'avgRating'  => $avgRating,
                'boardedPct' => $boardedPct,
                'failedPct'  => $failedPct,
            ],
            'dailyPickups'     => $dailyPickups,
            'routePerformance' => $routePerformance,
            'shuttleActivity'  => $shuttleActivity,
        ]);
    }
}
