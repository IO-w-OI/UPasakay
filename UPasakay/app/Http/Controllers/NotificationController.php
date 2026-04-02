<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Route;
use Carbon\Carbon;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $routes = Route::where('is_active', true)->pluck('name');

        // Get real notification log from database, ordered newest first
        $notificationLog = Notification::with('route')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'time' => $notification->created_at->format('h:i A'),
                    'type' => $notification->type,
                    'label' => ucfirst($notification->type),
                    'target' => $notification->target,
                    'status' => $notification->status,
                    'date' => $notification->created_at->format('M d'),
                    'title' => $notification->title,
                    'message' => $notification->message,
                ];
            });

        $scheduledNotifications = Notification::scheduled()
            ->orderBy('scheduled_at', 'asc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'schedule' => $notification->scheduled_at->format('M d, Y h:i A'),
                    'target' => $notification->target,
                    'auto' => false,
                    'active' => true,
                    'type' => $notification->type,
                    'status' => $notification->status,
                ];
            });

        return Inertia::render('Notifications/Index', [
            'routes' => $routes,
            'notificationLog' => $notificationLog,
            'scheduledNotifications' => $scheduledNotifications,
        ]);
    }
}
