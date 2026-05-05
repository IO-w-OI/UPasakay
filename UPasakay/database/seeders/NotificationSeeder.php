<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\NotificationSchedule;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some sample notification log entries
        Notification::create([
            'title' => 'Shuttle SH-001 started South Route',
            'message' => 'Shuttle SH-001 is now starting service on the South Route.',
            'type' => 'availability',
            'target_route' => 'South',
            'audience' => 'all',
            'status' => 'sent',
            'sent_at' => now()->subHours(2)->setMinutes(30),
        ]);

        Notification::create([
            'title' => 'Route Delay Notice',
            'message' => 'The North Route is currently delayed by approximately 15 minutes due to traffic.',
            'type' => 'delay',
            'target_route' => 'North',
            'audience' => 'passengers',
            'status' => 'sent',
            'sent_at' => now()->subHours(2)->setMinutes(5),
        ]);

        Notification::create([
            'title' => 'Route Change Notice',
            'message' => 'The East Route has been updated. Please check the app for the latest stops and schedule.',
            'type' => 'change',
            'target_route' => 'East',
            'audience' => 'all',
            'status' => 'sent',
            'sent_at' => now()->subDay()->setHour(15)->setMinutes(0),
        ]);

        Notification::create([
            'title' => 'Service Temporarily Suspended',
            'message' => 'Shuttle service has been temporarily suspended on the West Route. We will notify you when service resumes.',
            'type' => 'announcement',
            'target_route' => 'West',
            'audience' => 'all',
            'status' => 'sent',
            'sent_at' => now()->subDay()->setHour(8)->setMinutes(0),
        ]);

        Notification::create([
            'title' => 'Daily Schedule Notification',
            'message' => 'Your shuttle is arriving in 5 minutes. Be ready at your designated stop.',
            'type' => 'availability',
            'target_route' => 'all',
            'audience' => 'passengers',
            'status' => 'sent',
            'sent_at' => now()->subDays(2)->setHour(8)->setMinutes(0),
        ]);

        // Create a scheduled notification
        Notification::create([
            'title' => 'Peak Hour Reminder',
            'message' => 'Peak hour is about to start. Expect higher traffic on all routes.',
            'type' => 'announcement',
            'target_route' => 'all',
            'audience' => 'all',
            'status' => 'scheduled',
            'scheduled_at' => now()->addHours(3)->setMinutes(0),
        ]);

        // Create some recurring notification schedules
        NotificationSchedule::create([
            'name' => 'Morning Rush Hour Alert',
            'title' => 'Daily Schedule',
            'message' => 'Morning rush hour is starting. All routes are now active.',
            'type' => 'announcement',
            'target_route' => 'all',
            'audience' => 'all',
            'frequency' => 'daily',
            'time' => '06:00',
            'is_active' => true,
        ]);

        NotificationSchedule::create([
            'name' => 'End of Service',
            'title' => 'End of Service',
            'message' => 'Service has ended for today. Thank you for using our shuttle service.',
            'type' => 'announcement',
            'target_route' => 'all',
            'audience' => 'all',
            'frequency' => 'daily',
            'time' => '20:00',
            'is_active' => true,
        ]);

        NotificationSchedule::create([
            'name' => 'Weekend Service Reminder',
            'title' => 'Weekend Service Available',
            'message' => 'Limited weekend service is available today. Check the schedule for updated times.',
            'type' => 'announcement',
            'target_route' => 'all',
            'audience' => 'passengers',
            'frequency' => 'weekends',
            'time' => '07:00',
            'is_active' => true,
        ]);
    }
}
