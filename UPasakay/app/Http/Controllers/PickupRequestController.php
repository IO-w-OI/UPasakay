<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PickupRequestController extends Controller
{
    /**
     * Apply the search / route / date filters shared by the table, the
     * stat cards and the CSV export. The status filter is deliberately
     * left out so the per-status stat cards can each scope their own.
     */
    private function applyScope($query, Request $request)
    {
        $today = Carbon::today();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($qq) use ($search) {
                $qq->whereHas('user', fn ($u) => $u->where('email', 'like', "%$search%"))
                    ->orWhereHas('user.passenger', fn ($p) => $p->where('passenger_number', 'like', "%$search%"));
            });
        }

        if ($request->filled('route') && $request->route !== 'All') {
            $query->whereHas('route', fn ($r) => $r->where('name', $request->route));
        }

        if ($request->filled('date') && $request->date === 'today') {
            $query->whereDate('created_at', $today);
        }

        return $query;
    }

    public function index(Request $request)
    {
        // Stat cards: counts within the active scope, broken down by status,
        // so the figures track whatever the admin has filtered to.
        $scoped = fn () => $this->applyScope(PickupRequest::query(), $request);

        $stats = [
            'total' => $scoped()->count(),
            'pending' => $scoped()->where('status', 'pending')->count(),
            'accepted' => $scoped()->where('status', 'accepted')->count(),
            'in_progress' => $scoped()->where('status', 'in_progress')->count(),
            'completed' => $scoped()->where('status', 'completed')->count(),
            'cancelled' => $scoped()->where('status', 'cancelled')->count(),
        ];

        $query = $this->applyScope(
            PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop', 'assignment.driver']),
            $request
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
                'cancel_reason' => $r->cancel_reason,
                'rating' => $r->rating,
                'comment' => $r->comment,
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

    /**
     * Stream the filtered pickup requests as a CSV download. Honours the
     * same search / route / status / date filters as the table.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = $this->applyScope(
            PickupRequest::with(['user', 'route', 'pickupStop', 'dropoffStop', 'assignment.driver']),
            $request
        );

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        $filename = 'pickup-requests-'.now()->timezone('Asia/Manila')->format('Ymd-His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Request ID', 'Passenger', 'Waiting Location', 'Route',
                'Driver', 'Status', 'Rating', 'Comment',
                'Created', 'Completed', 'Cancellation Reason',
            ]);

            $query->latest()->chunk(200, function ($rows) use ($out) {
                foreach ($rows as $r) {
                    fputcsv($out, [
                        $r->id,
                        $r->user?->name ?? $r->user?->email ?? 'Unknown',
                        $r->pickupStop?->name ?? '—',
                        $r->route?->name ?? '—',
                        $r->assignment?->driver?->full_name ?? 'Unassigned',
                        $r->status,
                        $r->rating ?? '',
                        $r->comment ?? '',
                        $r->created_at ? Carbon::parse($r->created_at)->timezone('Asia/Manila')->format('M j, Y h:i A') : '',
                        $r->completed_at ? Carbon::parse($r->completed_at)->timezone('Asia/Manila')->format('M j, Y h:i A') : '',
                        $r->cancel_reason ?? '',
                    ]);
                }
            });

            fclose($out);
        }, $filename, $headers);
    }
}
