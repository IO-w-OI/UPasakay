<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Route;
use App\Models\Stop;
use App\Models\Shuttle;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiveMapController extends Controller
{
    public function index()
    {
        // Active & idle shuttles with latest location
        $shuttles = Shuttle::with(['route', 'driver', 'locations' => fn ($q) => $q->latest('recorded_at')->limit(1)])
            ->whereIn('status', ['active', 'idle'])
            ->orderBy('shuttle_code')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->shuttle_code,
                'driver' => $s->driver?->full_name ?? '—',
                'route' => $s->route?->name ?? '—',
                'status' => $s->status,
                'speed' => $s->locations->first()?->speed_kmh ?? 0,
                'last_seen' => $s->last_seen_at
                    ? $s->last_seen_at->diffForHumans(null, true).' ago'
                    : '—',
                'latitude' => $s->locations->first()?->latitude,
                'longitude' => $s->locations->first()?->longitude,
            ]);

        // Offline shuttles
        $offlineShuttles = Shuttle::with(['route', 'driver'])
            ->where('status', 'offline')
            ->orderBy('shuttle_code')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->shuttle_code,
                'driver' => $s->driver?->full_name ?? '—',
                'route' => $s->route?->name ?? '—',
                'status' => $s->status,
                'speed' => 0,
                'last_seen' => $s->last_seen_at
                    ? $s->last_seen_at->diffForHumans(null, true).' ago'
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
            ->map(fn ($r) => [
                'id' => $r->id,
                'passenger' => $r->user?->name ?? '—',
                'route' => $r->route?->name ?? '—',
                'stop' => $r->pickupStop?->name ?? '—',
                'time' => Carbon::parse($r->created_at)->format('h:i A'),
            ]);

        $routes = Route::query()
            ->where('is_active', true)
            ->orderByRaw("CASE name WHEN 'North' THEN 1 WHEN 'South' THEN 2 WHEN 'Cebu City' THEN 3 ELSE 4 END")
            ->get()
            ->map(fn (Route $route) => [
                'id' => $route->id,
                'name' => $route->name,
            ]);

        $stops = Stop::with('route')
            ->orderBy('route_id')
            ->orderBy('sequence')
            ->get()
            ->map(fn (Stop $stop) => [
                'id' => $stop->id,
                'route_id' => $stop->route_id,
                'name' => $stop->name,
                'sequence' => $stop->sequence,
                'latitude' => $stop->latitude,
                'longitude' => $stop->longitude,
                'is_active' => (bool) $stop->is_active,
                'route' => $stop->route ? [
                    'id' => $stop->route->id,
                    'name' => $stop->route->name,
                ] : null,
                'route_name' => $stop->route?->name,
            ]);

        return Inertia::render('LiveMap', [
            'shuttles' => $allShuttles,
            'pendingRequests' => $pendingRequests,
            'routes' => $routes,
            'stops' => $stops,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'name' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $nextSequence = (int) (Stop::where('route_id', $validated['route_id'])->max('sequence') ?? 0) + 1;

        Stop::create([
            'route_id' => $validated['route_id'],
            'name' => $validated['name'],
            'sequence' => $nextSequence,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Stop added successfully.');
    }

    public function update(Request $request, Stop $stop): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $stop->update($validated);

        return back()->with('success', 'Stop renamed.');
    }

    public function destroy(Stop $stop): RedirectResponse
    {
        $stop->delete();

        return back()->with('success', 'Stop deleted successfully.');
    }
}
