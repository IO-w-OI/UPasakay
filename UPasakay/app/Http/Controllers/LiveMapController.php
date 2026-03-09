<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Shuttle;
use Carbon\Carbon;
use Inertia\Inertia;

class LiveMapController extends Controller
{
    public function index()
    {
        // Active & idle shuttles with latest location
        $shuttles = Shuttle::with(['route', 'driver', 'locations' => fn($q) => $q->latest('recorded_at')->limit(1)])
            ->whereIn('status', ['active', 'idle'])
            ->orderBy('shuttle_code')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'code' => $s->shuttle_code,
                'driver' => $s->driver?->full_name ?? '—',
                'route' => $s->route?->name ?? '—',
                'status' => $s->status,
                'speed' => $s->locations->first()?->speed_kmh ?? 0,
                'last_seen' => $s->last_seen_at
                    ? $s->last_seen_at->diffForHumans(null, true) . ' ago'
                    : '—',
                'latitude' => $s->locations->first()?->latitude,
                'longitude' => $s->locations->first()?->longitude,
            ]);

        // Offline shuttles
        $offlineShuttles = Shuttle::with(['route', 'driver'])
            ->where('status', 'offline')
            ->orderBy('shuttle_code')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'code' => $s->shuttle_code,
                'driver' => $s->driver?->full_name ?? '—',
                'route' => $s->route?->name ?? '—',
                'status' => $s->status,
                'speed' => 0,
                'last_seen' => $s->last_seen_at
                    ? $s->last_seen_at->diffForHumans(null, true) . ' ago'
                    : '—',
                'latitude' => null,
                'longitude' => null,
            ]);

        $allShuttles = $shuttles->merge($offlineShuttles)->values();

        // Pending pickup requests
        $pendingRequests = PickupRequest::with(['user', 'route', 'pickupStop'])
            ->where('status', 'pending')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'passenger' => $r->user?->name ?? '—',
                'route' => $r->route?->name ?? '—',
                'stop' => $r->pickupStop?->name ?? '—',
                'time' => Carbon::parse($r->created_at)->format('h:i A'),
            ]);

        return Inertia::render('LiveMap', [
            'shuttles' => $allShuttles,
            'pendingRequests' => $pendingRequests,
        ]);
    }
}
