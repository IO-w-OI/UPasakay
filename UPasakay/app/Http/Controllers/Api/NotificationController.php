<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('target')) {
            $query->where('target', $request->target);
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();

        return response()->json($notifications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:schedule,delay,change,alert,custom,availability,announcement',
            'message' => 'nullable|string',
            'target' => 'required|string',
            'route_id' => 'nullable|exists:routes,id',
            'status' => 'sometimes|string|in:pending,sent,scheduled,failed',
        ]);

        $validated['target_route'] = $validated['target'] ?? 'all';
        $validated['audience'] = 'all';

        $notification = Notification::create($validated);

        return response()->json($notification, 201);
    }

    public function show(Notification $notification)
    {
        return response()->json($notification->load('route'));
    }

    public function update(Request $request, Notification $notification)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:schedule,delay,change,alert,custom,availability,announcement',
            'message' => 'nullable|string',
            'target' => 'sometimes|string',
            'route_id' => 'nullable|exists:routes,id',
            'status' => 'sometimes|string|in:pending,sent,scheduled,failed',
        ]);

        if (array_key_exists('target', $validated)) {
            $validated['target_route'] = $validated['target'];
        }

        $notification->update($validated);

        return response()->json($notification);
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }

    public function schedule(Request $request, Notification $notification)
    {
        $validated = $request->validate([
            'scheduled_at' => 'required|date_format:Y-m-d H:i:s|after:now',
        ]);

        $notification->scheduleFor($validated['scheduled_at']);

        return response()->json([
            'message' => 'Notification scheduled successfully',
            'notification' => $notification,
        ]);
    }

    public function send(Notification $notification)
    {
        $notification->markAsSent();

        return response()->json([
            'message' => 'Notification sent successfully',
            'notification' => $notification,
        ]);
    }

    public function scheduled()
    {
        $notifications = Notification::scheduled()->orderBy('scheduled_at', 'asc')->get();

        return response()->json($notifications);
    }

    public function processScheduledNotifications()
    {
        $readyToSend = Notification::readyToSend()->get();

        foreach ($readyToSend as $notification) {
            $notification->markAsSent();
        }

        return response()->json([
            'message' => 'Scheduled notifications processed',
            'processed_count' => $readyToSend->count(),
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Notification::count(),
            'sent' => Notification::sent()->count(),
            'pending' => Notification::pending()->count(),
            'scheduled' => Notification::scheduled()->count(),
            'failed' => Notification::where('status', 'failed')->count(),
            'by_type' => Notification::selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
        ];

        return response()->json($stats);
    }
}
