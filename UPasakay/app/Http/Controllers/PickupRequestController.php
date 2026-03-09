<?php

namespace App\Http\Controllers;

use App\Models\Driver;
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

        // Stats
        $totalToday = PickupRequest::whereDate('created_at', $today)->count();
        $pendingToday = PickupRequest::whereDate('created_at', $today)->where('status', 'pending')->count();
        $completedToday = PickupRequest::whereDate('created_at', $today)->where('status', 'completed')->count();
        $cancelledToday = PickupRequest::whereDate('created_at', $today)->where('status', 'cancelled')->count();

        $query = PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop', 'assignment.driver']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%"));
        }

        if ($request->filled('route') && $request->route !== 'All') {
            $query->whereHas('route', fn($q) => $q->where('name', $request->route));
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('date') && $request->date === 'today') {
            $query->whereDate('created_at', $today);
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
                'time' => Carbon::parse($r->created_at)->format('h:i A'),
                'date' => Carbon::parse($r->created_at)->format('M j'),
                'eta' => '~4 minutes',
                'latitude' => null,
                'longitude' => null,
            ];
        });

        $routes = Route::where('is_active', true)->pluck('name');

        return Inertia::render('PickupRequests/Index', [
            'requests' => $requests,
            'routes' => $routes,
            'filters' => $request->only(['search', 'route', 'status', 'date']),
            'stats' => [
                'total' => $totalToday,
                'pending' => $pendingToday,
                'completed' => $completedToday,
                'cancelled' => $cancelledToday,
            ],
        ]);
    }
}
