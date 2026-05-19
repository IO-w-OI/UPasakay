<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Route;
use App\Models\Shuttle;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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
            $status = $request->status;
            if (in_array($status, ['active', 'idle', 'offline', 'suspended'])) {
                $query->where('driver_status', $status);
            }
        }

        if ($request->filled('route')) {
            $routeName = $request->route;
            $query->whereIn('id', function ($sub) use ($routeName) {
                $sub->select('driver_id')
                    ->from('shuttles')
                    ->join('routes', 'routes.id', '=', 'shuttles.route_id')
                    ->where('routes.name', $routeName);
            });
        }

        $drivers = $query->orderBy('full_name')->paginate(25)->withQueryString();

        // Enrich with shuttle/route data
        $shuttleMap = Shuttle::with('route')
            ->whereNotNull('driver_id')
            ->get()
            ->keyBy('driver_id');

        $drivers->getCollection()->transform(function ($d) use ($shuttleMap) {
            $shuttle = $shuttleMap->get($d->id);

            // Determine last-active display
            $lastActive = '—';
            $lastActiveRaw = null;
            if ($d->user?->updated_at) {
                $lastActiveRaw = Carbon::parse($d->user->updated_at);
                $diffMinutes = $lastActiveRaw->diffInMinutes(now());
                if ($diffMinutes < 2) {
                    $lastActive = 'Online now';
                } elseif ($diffMinutes < 60) {
                    $lastActive = $diffMinutes.' min ago';
                } else {
                    $lastActive = $lastActiveRaw->diffForHumans();
                }
            }

            return [
                'id' => $d->id,
                'employee_id' => 'D-'.str_pad($d->id, 3, '0', STR_PAD_LEFT),
                'full_name' => $d->full_name ?? '—',
                'email' => $d->user?->email ?? '—',
                'license_number' => $d->license_number ?? '—',
                'status' => $d->driver_status ?? ($d->is_available ? 'active' : 'offline'),
                'route' => $shuttle?->route?->name ?? '—',
                'route_id' => $shuttle?->route_id,
                'shuttle' => $shuttle?->shuttle_code ?? '—',
                'shuttle_id' => $shuttle?->id,
                'last_active' => $lastActive,
                'is_online' => $lastActiveRaw && $lastActiveRaw->diffInMinutes(now()) < 2,
                'total_pickups' => $d->total_pickups ?? 0,
            ];
        });

        $routes = Route::where('is_active', true)->pluck('name');

        // id + name pairs for the shuttle route-assignment dropdown
        $routeOptions = Route::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]);

        // All shuttles for the shuttle management table
        $shuttles = Shuttle::with(['route', 'driver'])->orderBy('shuttle_code')->get()->map(fn ($s) => [
            'id' => $s->id,
            'shuttle_code' => $s->shuttle_code,
            'boarding_code' => $s->boarding_code,
            'shuttle_type' => $s->shuttle_type ?? 'van',
            'plate_number' => $s->plate_number,
            'capacity' => $s->capacity,
            'status' => $s->status ?? ($s->is_active ? 'active' : 'inactive'),
            'route' => $s->route?->name ?? '—',
            'route_id' => $s->route_id,
            'driver' => $s->driver?->full_name ?? '—',
            'driver_id' => $s->driver_id,
            'is_active' => $s->is_active,
        ]);

        // Unassigned shuttles (for assignment dropdowns)
        $unassignedShuttles = Shuttle::whereNull('driver_id')
            ->where('is_active', true)
            ->get()
            ->map(fn ($s) => ['id' => $s->id, 'shuttle_code' => $s->shuttle_code]);

        // All drivers list (for shuttle-driver assignment)
        $allDrivers = Driver::where('driver_status', '!=', 'suspended')
            ->get()
            ->map(fn ($d) => ['id' => $d->id, 'full_name' => $d->full_name]);

        return Inertia::render('Drivers/Index', [
            'drivers' => $drivers,
            'shuttles' => $shuttles,
            'unassignedShuttles' => $unassignedShuttles,
            'allDrivers' => $allDrivers,
            'routes' => $routes,
            'routeOptions' => $routeOptions,
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
            ->map(fn ($a) => [
                'date' => Carbon::parse($a->created_at)->timezone('Asia/Manila')->format('M j'),
                'event' => match ($a->pickupRequest?->status ?? 'unknown') {
                    'completed' => 'Pickup completed',
                    'cancelled' => 'Pickup cancelled',
                    default => 'Pickup assigned',
                },
                'route' => $a->pickupRequest?->route?->name ?? '—',
                'time' => Carbon::parse($a->created_at)->timezone('Asia/Manila')->format('h:i A'),
            ]);

        return Inertia::render('Drivers/Show', [
            'driver' => [
                'id' => $driver->id,
                'employee_id' => 'D-'.str_pad($driver->id, 3, '0', STR_PAD_LEFT),
                'full_name' => $driver->full_name ?? '—',
                'license' => $driver->license_number,
                'status' => $driver->driver_status ?? ($driver->is_available ? 'active' : 'offline'),
                'route' => $shuttle?->route?->name ?? '—',
                'shuttle' => $shuttle?->shuttle_code ?? '—',
                'shuttle_id' => $shuttle?->id,
                'email' => $driver->user?->email ?? '—',
                'last_login' => $driver->user?->updated_at
                    ? Carbon::parse($driver->user->updated_at)->timezone('Asia/Manila')->format('M j, Y h:i A')
                    : '—',
                'total_sessions' => $totalSessions,
                'total_pickups' => $totalPickups,
                'avg_rating' => '4.5',
            ],
            'activityLog' => $activityLog,
            'unassignedShuttles' => Shuttle::whereNull('driver_id')
                ->where('is_active', true)
                ->get()
                ->map(fn ($s) => ['id' => $s->id, 'shuttle_code' => $s->shuttle_code]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'license_number' => 'required|string|unique:drivers,license_number',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'route_id' => 'nullable|string',
            'shuttle_id' => 'nullable|integer|exists:shuttles,id',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password_hash' => $request->password,
        ]);

        $driver = Driver::create([
            'user_id' => $user->id,
            'full_name' => $request->full_name,
            'license_number' => $request->license_number,
            'is_available' => true,
            'driver_status' => 'active',
        ]);

        // Assign shuttle if provided
        if ($request->shuttle_id) {
            Shuttle::where('id', $request->shuttle_id)
                ->whereNull('driver_id')
                ->update(['driver_id' => $driver->id]);
        }

        return back()->with('success', 'Driver created successfully.');
    }

    public function update(Request $request, Driver $driver)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'license_number' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'driver_status' => 'sometimes|string|in:active,idle,offline,suspended',
            'route_id' => 'nullable|string',
            'shuttle_id' => 'nullable|integer',
        ]);

        $driver->update($request->only(['full_name', 'license_number', 'driver_status']));

        // Sync is_available from driver_status
        if ($request->has('driver_status')) {
            $driver->update([
                'is_available' => in_array($request->driver_status, ['active', 'idle']),
            ]);
        }

        // Update email if provided
        if ($request->has('email') && $driver->user) {
            $driver->user->update(['email' => $request->email]);
        }

        // Handle shuttle reassignment
        if ($request->has('shuttle_id')) {
            // Unassign current shuttle
            Shuttle::where('driver_id', $driver->id)->update(['driver_id' => null]);
            // Assign new shuttle
            if ($request->shuttle_id) {
                Shuttle::where('id', $request->shuttle_id)->update(['driver_id' => $driver->id]);
            }
        }

        return back()->with('success', 'Driver updated successfully.');
    }

    public function resetPassword(Request $request, Driver $driver)
    {
        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        if ($driver->user) {
            $driver->user->update(['password_hash' => $request->password]);
        }

        return back()->with('success', 'Password reset successfully.');
    }

    public function destroy(Request $request, Driver $driver)
    {
        $action = $request->input('action', 'deactivate');

        if ($action === 'archive') {
            $driver->update(['driver_status' => 'offline', 'is_available' => false]);
            // Unassign shuttle
            Shuttle::where('driver_id', $driver->id)->update(['driver_id' => null]);

            return back()->with('success', 'Driver archived.');
        }

        // Default: deactivate
        $driver->update(['driver_status' => 'offline', 'is_available' => false]);

        return back()->with('success', 'Driver deactivated.');
    }
}
