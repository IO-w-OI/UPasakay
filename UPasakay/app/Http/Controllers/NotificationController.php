<?php

namespace App\Http\Controllers;

use App\Models\DeviceToken;
use App\Models\Notification;
use App\Models\NotificationSchedule;
use App\Models\Route;
use App\Services\ExpoPushService;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        // Get active routes for the form
        $routes = Route::where('is_active', true)
            ->orderBy('name')
            ->pluck('name');

        // Get notification log with latest entries first
        $notificationLog = Notification::query()
            ->orderByDesc('sent_at')
            ->orderByDesc('created_at')
            ->take(50)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'time' => $notification->getFormattedTime(),
                'type' => $notification->type,
                'label' => $notification->getTypeLabel(),
                'target' => $notification->getTargetLabel(),
                'audience' => $notification->audience ?? 'all',
                'status' => $notification->status,
                'date' => $notification->getFormattedDate(),
                'message' => $notification->message,
                'title' => $notification->title,
                // Alert rows are system-generated (boarding events, etc.) —
                // the UI tags them "System" rather than an admin broadcast.
                'is_system' => $notification->isSystemGenerated(),
            ]);

        // Get recurring notification schedules
        $scheduledNotifications = NotificationSchedule::query()
            ->orderBy('is_active', 'desc')
            ->orderBy('time')
            ->get()
            ->map(fn ($schedule) => [
                'id' => $schedule->id,
                'title' => $schedule->name,
                'schedule' => $schedule->getScheduleDisplay(),
                'target' => $schedule->getTargetLabel(),
                'auto' => true, // All schedules are automated
                'active' => $schedule->is_active,
                // Raw fields so the edit modal can be pre-filled.
                'name' => $schedule->name,
                'notif_title' => $schedule->title,
                'message' => $schedule->message,
                'type' => $schedule->type,
                'target_route' => $schedule->target_route ?? 'all',
                'audience' => $schedule->audience ?? 'all',
                'frequency' => $schedule->frequency,
                'time' => substr((string) $schedule->time, 0, 5),
            ]);

        return Inertia::render('Notifications/Index', [
            'routes' => $routes,
            'notificationLog' => $notificationLog,
            'scheduledNotifications' => $scheduledNotifications,
        ]);
    }

    /**
     * Store a new notification (immediate or scheduled)
     */
    public function store()
    {
        $validated = request()->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:160',
            'type' => 'required|in:availability,delay,change,announcement',
            'target_route' => 'required|string',
            'audience' => 'required|in:all,passengers,drivers',
            'delivery_type' => 'required|in:now,scheduled',
            'schedule_date' => 'required_if:delivery_type,scheduled|date',
            'schedule_time' => 'required_if:delivery_type,scheduled|date_format:H:i',
        ]);

        if ($validated['delivery_type'] === 'scheduled') {
            // The admin picks the date/time in Manila time — parse it in that
            // zone so the stored UTC value fires at the intended moment.
            $scheduledAt = \Carbon\Carbon::createFromFormat(
                'Y-m-d H:i',
                $validated['schedule_date'].' '.$validated['schedule_time'],
                Notification::DISPLAY_TZ,
            )->utc();

            Notification::create([
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'],
                'target_route' => $validated['target_route'],
                'audience' => $validated['audience'],
                'status' => 'scheduled',
                'scheduled_at' => $scheduledAt,
            ]);
        } else {
            // Send immediately — fan-out respects the chosen audience and,
            // for drivers, the target route.
            $notification = Notification::create([
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'],
                'target_route' => $validated['target_route'],
                'audience' => $validated['audience'],
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $notification->dispatchPush();
        }

        return back()->with('success', 'Notification '.($validated['delivery_type'] === 'scheduled' ? 'scheduled' : 'sent').' successfully.');
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return back()->with('success', 'Notification deleted successfully.');
    }

    /**
     * Store a new recurring schedule
     */
    public function storeSchedule()
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:160',
            'type' => 'required|in:availability,delay,change,announcement',
            'target_route' => 'required|string',
            'audience' => 'required|in:all,passengers,drivers',
            'frequency' => 'required|in:daily,weekdays,weekends,custom',
            'time' => 'required|date_format:H:i',
        ]);

        NotificationSchedule::create($validated);

        return back()->with('success', 'Schedule created successfully.');
    }

    /**
     * Update a recurring schedule
     */
    public function updateSchedule($id)
    {
        $schedule = NotificationSchedule::findOrFail($id);

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:160',
            'type' => 'required|in:availability,delay,change,announcement',
            'target_route' => 'required|string',
            'audience' => 'required|in:all,passengers,drivers',
            'frequency' => 'required|in:daily,weekdays,weekends,custom',
            'time' => 'required|date_format:H:i',
            'is_active' => 'boolean',
        ]);

        $schedule->update($validated);

        return back()->with('success', 'Schedule updated successfully.');
    }

    /**
     * Toggle schedule active status
     */
    public function toggleSchedule($id)
    {
        $schedule = NotificationSchedule::findOrFail($id);
        $schedule->toggleActive();

        return back()->with('success', 'Schedule '.($schedule->is_active ? 'activated' : 'deactivated').' successfully.');
    }

    /**
     * Delete a schedule
     */
    public function destroySchedule($id)
    {
        $schedule = NotificationSchedule::findOrFail($id);
        $schedule->delete();

        return back()->with('success', 'Schedule deleted successfully.');
    }
}
