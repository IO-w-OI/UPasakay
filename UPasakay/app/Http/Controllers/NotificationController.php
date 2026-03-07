<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Carbon\Carbon;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $routes = Route::where('is_active', true)->pluck('name');

        // Mock notification log — replace with a real model when available
        $notificationLog = collect([
            ['time' => '08:00 AM', 'type' => 'schedule', 'label' => 'Schedule',  'target' => 'All',   'status' => 'sent', 'date' => 'Today'],
            ['time' => '07:55 AM', 'type' => 'delay',    'label' => 'Delay',     'target' => 'South', 'status' => 'sent', 'date' => 'Today'],
            ['time' => '08:00 AM', 'type' => 'schedule', 'label' => 'Schedule',  'target' => 'All',   'status' => 'sent', 'date' => 'Yesterday'],
            ['time' => '03:00 PM', 'type' => 'change',   'label' => 'Change',    'target' => 'North', 'status' => 'sent', 'date' => 'Yesterday'],
            ['time' => '08:00 AM', 'type' => 'schedule', 'label' => 'Schedule',  'target' => 'All',   'status' => 'sent', 'date' => 'Mar 3'],
        ]);

        $scheduledNotifications = collect([
            ['id' => 1, 'title' => 'Daily Schedule',   'schedule' => 'Every day 6:00 AM', 'target' => 'All', 'auto' => true,  'active' => true],
            ['id' => 2, 'title' => 'End of Service',   'schedule' => 'Every day 8:00 PM', 'target' => 'All', 'auto' => true,  'active' => true],
        ]);

        return Inertia::render('Notifications/Index', [
            'routes'                 => $routes,
            'notificationLog'        => $notificationLog,
            'scheduledNotifications' => $scheduledNotifications,
        ]);
    }
}
