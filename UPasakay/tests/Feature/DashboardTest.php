<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_recent_activity_feed_is_built_from_activity_logs_only()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        ActivityLog::create([
            'type' => 'login',
            'description' => 'older activity entry',
            'created_at' => now()->subMinutes(10),
            'updated_at' => now()->subMinutes(10),
        ]);

        ActivityLog::create([
            'type' => 'assignment_created',
            'description' => 'newer activity entry',
            'created_at' => now()->subMinutes(1),
            'updated_at' => now()->subMinutes(1),
        ]);

        $response = $this->get(route('dashboard'));

        $response
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Dashboard')
                    ->has('recentActivity', 2)
                    ->where('recentActivity.0.text', 'newer activity entry')
                    ->where('recentActivity.0.icon', 'bus')
                    ->where('recentActivity.1.text', 'older activity entry')
                    ->where('recentActivity.1.icon', 'user')
            );
    }

    public function test_dashboard_recent_activity_feed_is_limited_to_six_latest_logs()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        for ($i = 1; $i <= 7; $i++) {
            ActivityLog::create([
                'type' => 'pickup_created',
                'description' => "activity {$i}",
                'created_at' => now()->subMinutes(8 - $i),
                'updated_at' => now()->subMinutes(8 - $i),
            ]);
        }

        $response = $this->get(route('dashboard'));

        $response
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Dashboard')
                    ->has('recentActivity', 6)
                    ->where('recentActivity.0.text', 'activity 7')
                    ->where('recentActivity.5.text', 'activity 2')
            );
    }
}
