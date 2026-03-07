<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Route;
use App\Models\Shuttle;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $query = Driver::with(['user', 'assignments'])
            ->withCount('assignments as total_pickups');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%$search%")
                    ->orWhere('license_number', 'like', "%$search%");
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_available', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_available', false);
            }
        }

        $drivers = $query->orderBy('full_name')->paginate(25)->withQueryString();

        // Enrich with shuttle/route data
        $shuttleMap = Shuttle::with('route')
            ->whereNotNull('driver_id')
            ->get()
            ->keyBy('driver_id');

        $drivers->getCollection()->transform(function ($d) use ($shuttleMap) {
            $shuttle = $shuttleMap->get($d->id);
            return [
                'id' => $d->id,
                'employee_id' => 'D-' . str_pad($d->id, 3, '0', STR_PAD_LEFT),
                'full_name' => $d->full_name ?? '—',
                'status' => $d->is_available ? 'active' : 'inactive',
                'route' => $shuttle?->route?->name ?? '—',
                'shuttle' => $shuttle?->shuttle_code ?? '—',
                'last_login' => $d->user?->updated_at
                    ? Carbon::parse($d->user->updated_at)->diffForHumans()
                    : '—',
            ];
        });

        $routes = Route::where('is_active', true)->pluck('name');

        return Inertia::render('Drivers/Index', [
            'drivers' => $drivers,
            'routes' => $routes,
            'filters' => $request->only(['search', 'status', 'route']),
        ]);
    }

    public function show(Driver $driver)
    {
        $driver->load(['user', 'assignments.pickupRequest.route']);

        $shuttle = Shuttle::with('route')
            ->where('driver_id', $driver->id)
            ->first();

        $totalPickups = $driver->assignments()->count();
        $totalSessions = max(1, (int) ($totalPickups / 6));

        // Build activity log from assignments
        $activityLog = $driver->assignments()
            ->with('pickupRequest.route')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($a) => [
                'date' => Carbon::parse($a->created_at)->format('M j'),
                'event' => match ($a->pickupRequest?->status ?? 'unknown') {
                    'completed' => 'Pickup completed',
                    'cancelled' => 'Pickup cancelled',
                    default => 'Pickup assigned',
                },
                'route' => $a->pickupRequest?->route?->name ?? '—',
                'time' => Carbon::parse($a->created_at)->format('h:i A'),
            ]);

        return Inertia::render('Drivers/Show', [
            'driver' => [
                'id' => $driver->id,
                'employee_id' => 'D-' . str_pad($driver->id, 3, '0', STR_PAD_LEFT),
                'full_name' => $driver->full_name ?? '—',
                'license' => $driver->license_number,
                'status' => $driver->is_available ? 'active' : 'inactive',
                'route' => $shuttle?->route?->name ?? '—',
                'shuttle' => $shuttle?->shuttle_code ?? '—',
                'email' => $driver->user?->email ?? '—',
                'last_login' => $driver->user?->updated_at
                    ? Carbon::parse($driver->user->updated_at)->format('M j, Y h:i A')
                    : '—',
                'total_sessions' => $totalSessions,
                'total_pickups' => $totalPickups,
                'avg_rating' => '4.5',
            ],
            'activityLog' => $activityLog,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'license_number' => 'required|string|unique:drivers,license_number',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
        ]);

        Driver::create([
            'user_id' => $user->id,
            'full_name' => $request->full_name,
            'license_number' => $request->license_number,
            'is_available' => true,
        ]);

        return back()->with('success', 'Driver created successfully.');
    }

    public function update(Request $request, Driver $driver)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'is_available' => 'boolean',
        ]);

        $driver->update($request->only(['full_name', 'is_available']));

        return back()->with('success', 'Driver updated successfully.');
    }

    public function destroy(Driver $driver)
    {
        $driver->update(['is_available' => false]);
        return back()->with('success', 'Driver deactivated.');
    }
}
