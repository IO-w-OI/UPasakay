<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PickupRequestController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        // Filters shared by the table and the stat cards (everything except
        // the status filter — the per-status cards each scope their own
        // status, so applying it here would zero out the other cards).
        $applyScope = function ($q) use ($request, $today) {
            if ($request->filled('search')) {
                $search = $request->search;
                $q->where(function ($qq) use ($search) {
                    $qq->whereHas('user', fn ($u) => $u->where('email', 'like', "%$search%"))
                        ->orWhereHas('user.passenger', fn ($p) => $p->where('passenger_number', 'like', "%$search%"));
                });
            }

            if ($request->filled('route') && $request->route !== 'All') {
                $q->whereHas('route', fn ($r) => $r->where('name', $request->route));
            }

            if ($request->filled('date') && $request->date === 'today') {
                $q->whereDate('created_at', $today);
            }

            return $q;
        };

        // Stat cards: counts within the active scope, broken down by status,
        // so the figures track whatever the admin has filtered to.
        $scoped = fn () => $applyScope(PickupRequest::query());

        $stats = [
            'total' => $scoped()->count(),
            'pending' => $scoped()->where('status', 'pending')->count(),
            'accepted' => $scoped()->where('status', 'accepted')->count(),
            'in_progress' => $scoped()->where('status', 'in_progress')->count(),
            'completed' => $scoped()->where('status', 'completed')->count(),
            'cancelled' => $scoped()->where('status', 'cancelled')->count(),
        ];

        $query = $applyScope(
            PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop', 'assignment.driver'])
        );

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        $requests = $query->latest()->paginate(25)->withQueryString();

        $requests->getCollection()->transform(function ($r) {
            return [
                'id' => $r->id,
                'passenger' => $r->user?->name ?? $r->user?->email ?? 'Unknown',
                'location' => $r->pickupStop?->name ?? '—',
                'route' => $r->route?->name ?? '—',
                'driver' => $r->assignment?->driver?->full_name ?? 'Unassigned',
                'status' => $r->status,
                'time' => Carbon::parse($r->created_at)->timezone('Asia/Manila')->format('h:i A'),
                'date' => Carbon::parse($r->created_at)->timezone('Asia/Manila')->format('M j'),
                'created_at' => $r->created_at ? Carbon::parse($r->created_at)->timezone('Asia/Manila')->format('M j, Y h:i A') : null,
                'completed_at' => $r->completed_at ? Carbon::parse($r->completed_at)->timezone('Asia/Manila')->format('M j, Y h:i A') : null,
                'eta' => '~4 minutes',
                'latitude' => $r->pickupStop?->latitude,
                'longitude' => $r->pickupStop?->longitude,
            ];
        });

        $routes = Route::where('is_active', true)->pluck('name');

        return Inertia::render('PickupRequests/Index', [
            'requests' => $requests,
            'routes' => $routes,
            'filters' => $request->only(['search', 'route', 'status', 'date']),
            'stats' => $stats,
        ]);
    }

}
