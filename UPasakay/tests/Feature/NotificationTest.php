<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Route;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    /**
     * Test creating a notification
     */
    public function test_create_notification()
    {
        $response = $this->postJson('/api/notifications', [
            'title' => 'Schedule Announcement',
            'type' => 'schedule',
            'message' => 'Daily schedule updated',
            'target' => 'All',
            'status' => 'sent',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'title', 'type', 'message', 'status', 'target', 'created_at']);

        $this->assertDatabaseHas('notifications', [
            'title' => 'Schedule Announcement',
            'type' => 'schedule',
        ]);
    }

    /**
     * Test getting all notifications
     */
    public function test_list_notifications()
    {
        Notification::factory()->count(5)->create();

        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(5);
    }

    /**
     * Test filtering notifications by status
     */
    public function test_filter_notifications_by_status()
    {
        Notification::factory()->count(3)->create(['status' => 'sent']);
        Notification::factory()->count(2)->create(['status' => 'pending']);

        $response = $this->getJson('/api/notifications?status=sent');

        $response->assertStatus(200)
            ->assertJsonCount(3);

        foreach ($response->json() as $notification) {
            $this->assertEquals('sent', $notification['status']);
        }
    }

    /**
     * Test filtering notifications by type
     */
    public function test_filter_notifications_by_type()
    {
        Notification::factory()->count(3)->create(['type' => 'schedule']);
        Notification::factory()->count(2)->create(['type' => 'delay']);

        $response = $this->getJson('/api/notifications?type=schedule');

        $response->assertStatus(200)
            ->assertJsonCount(3);

        foreach ($response->json() as $notification) {
            $this->assertEquals('schedule', $notification['type']);
        }
    }

    /**
     * Test filtering notifications by target
     */
    public function test_filter_notifications_by_target()
    {
        Notification::factory()->count(2)->create(['target' => 'All']);
        Notification::factory()->count(3)->create(['target' => 'South']);

        $response = $this->getJson('/api/notifications?target=South');

        $response->assertStatus(200)
            ->assertJsonCount(3);

        foreach ($response->json() as $notification) {
            $this->assertEquals('South', $notification['target']);
        }
    }

    /**
     * Test viewing a single notification
     */
    public function test_view_single_notification()
    {
        $notification = Notification::factory()->create();

        $response = $this->getJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $notification->id,
                'title' => $notification->title,
                'type' => $notification->type,
            ]);
    }

    /**
     * Test updating a notification
     */
    public function test_update_notification()
    {
        $notification = Notification::factory()->create();

        $response = $this->putJson("/api/notifications/{$notification->id}", [
            'title' => 'Updated Title',
            'message' => 'Updated message',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Updated Title',
                'message' => 'Updated message',
            ]);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'title' => 'Updated Title',
        ]);
    }

    /**
     * Test deleting a notification
     */
    public function test_delete_notification()
    {
        $notification = Notification::factory()->create();

        $response = $this->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
        ]);
    }

    /**
     * Test scheduling a notification
     */
    public function test_schedule_notification()
    {
        $notification = Notification::factory()->create(['status' => 'pending']);
        $scheduledTime = now()->addHours(2);

        $response = $this->postJson(
            "/api/notifications/{$notification->id}/schedule",
            [
                'scheduled_at' => $scheduledTime->format('Y-m-d H:i:s'),
            ]
        );

        $response->assertStatus(200)
            ->assertJson(['message' => 'Notification scheduled successfully']);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'status' => 'scheduled',
        ]);
    }

    /**
     * Test sending a notification
     */
    public function test_send_notification()
    {
        $notification = Notification::factory()->create(['status' => 'pending']);

        $response = $this->postJson("/api/notifications/{$notification->id}/send");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Notification sent successfully']);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'status' => 'sent',
        ]);

        // Verify sent_at timestamp is set
        $updated = $notification->fresh();
        $this->assertNotNull($updated->sent_at);
    }

    /**
     * Test getting scheduled notifications
     */
    public function test_get_scheduled_notifications()
    {
        Notification::factory()->count(2)->create(['status' => 'scheduled']);
        Notification::factory()->count(3)->create(['status' => 'sent']);

        $response = $this->getJson('/api/notifications/scheduled');

        $response->assertStatus(200)
            ->assertJsonCount(2);

        foreach ($response->json() as $notification) {
            $this->assertEquals('scheduled', $notification['status']);
        }
    }

    /**
     * Test processing scheduled notifications
     */
    public function test_process_scheduled_notifications()
    {
        // Create notifications scheduled in the past
        $pastNotification1 = Notification::factory()->create([
            'status' => 'scheduled',
            'scheduled_at' => now()->subHours(1),
        ]);
        $pastNotification2 = Notification::factory()->create([
            'status' => 'scheduled',
            'scheduled_at' => now()->subMinutes(30),
        ]);

        // Create notification scheduled for future (should not be processed)
        $futureNotification = Notification::factory()->create([
            'status' => 'scheduled',
            'scheduled_at' => now()->addHours(2),
        ]);

        $response = $this->postJson('/api/notifications/process-scheduled');

        $response->assertStatus(200)
            ->assertJson(['processed_count' => 2]);

        // Verify past notifications are marked as sent
        $this->assertDatabaseHas('notifications', [
            'id' => $pastNotification1->id,
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('notifications', [
            'id' => $pastNotification2->id,
            'status' => 'sent',
        ]);

        // Verify future notification is still scheduled
        $this->assertDatabaseHas('notifications', [
            'id' => $futureNotification->id,
            'status' => 'scheduled',
        ]);
    }

    /**
     * Test notification statistics
     */
    public function test_notification_stats()
    {
        Notification::factory()->count(5)->create(['status' => 'sent']);
        Notification::factory()->count(2)->create(['status' => 'pending']);
        Notification::factory()->count(3)->create(['status' => 'scheduled']);

        $response = $this->getJson('/api/notifications/stats');

        $response->assertStatus(200)
            ->assertJson([
                'total' => 10,
                'sent' => 5,
                'pending' => 2,
                'scheduled' => 3,
            ]);
    }

    /**
     * Test notification with route association
     */
    public function test_notification_with_route()
    {
        $route = Route::factory()->create();

        $response = $this->postJson('/api/notifications', [
            'title' => 'Route Delay',
            'type' => 'delay',
            'message' => 'Delay on main route',
            'target' => $route->name,
            'route_id' => $route->id,
            'status' => 'sent',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'route_id' => $route->id,
        ]);
    }

    /**
     * Test validation when creating notification
     */
    public function test_create_notification_validation()
    {
        $response = $this->postJson('/api/notifications', [
            'type' => 'invalid_type',
            // Missing required fields
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'target', 'type']);
    }

    /**
     * Test validation when scheduling notification
     */
    public function test_schedule_notification_validation()
    {
        $notification = Notification::factory()->create();

        // Try to schedule with past date
        $response = $this->postJson(
            "/api/notifications/{$notification->id}/schedule",
            [
                'scheduled_at' => now()->subHours(1)->format('Y-m-d H:i:s'),
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scheduled_at']);
    }

    /**
     * Test notification model scopes
     */
    public function test_notification_model_scopes()
    {
        Notification::factory()->count(3)->create(['status' => 'sent']);
        Notification::factory()->count(2)->create(['status' => 'pending']);
        Notification::factory()->count(4)->create(['status' => 'scheduled']);

        $this->assertEquals(3, Notification::sent()->count());
        $this->assertEquals(2, Notification::pending()->count());
        $this->assertEquals(4, Notification::scheduled()->count());
    }

    /**
     * Test notification with metadata
     */
    public function test_notification_with_metadata()
    {
        $metadata = [
            'recipient_count' => 150,
            'shuttle_ids' => [1, 2, 3],
        ];

        $response = $this->postJson('/api/notifications', [
            'title' => 'Broadcast',
            'type' => 'custom',
            'message' => 'Test with metadata',
            'target' => 'All',
            'status' => 'sent',
        ]);

        $notification = Notification::find($response->json('id'));
        $notification->update(['metadata' => $metadata]);

        $this->assertEquals($metadata, $notification->fresh()->metadata);
    }
}
