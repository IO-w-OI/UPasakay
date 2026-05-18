<?php

namespace Tests\Feature;

use App\Events\RideAccepted;
use App\Models\Driver;
use App\Models\Notification;
use App\Models\Passenger;
use App\Models\PickupRequest;
use App\Models\Route;
use App\Models\Shuttle;
use App\Models\Stop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DriverApiTest extends TestCase
{
    use RefreshDatabase;

    private int $seq = 0;

    /**
     * Auto-accept and queue promotion broadcast RideAccepted + send mail.
     * Fake them (same pattern as DriverAssignmentApiConsistencyTest) so the
     * suite never reaches the real Pusher/SMTP endpoints.
     */
    protected function setUp(): void
    {
        parent::setUp();
        Event::fake([RideAccepted::class]);
        Mail::fake();
    }

    /**
     * Authenticate the next request as $user. forgetGuards() clears the
     * guard's cached resolved user so each call re-resolves from its own
     * Bearer token — required when one test acts as several users in turn.
     */
    private function authHeaders(User $user): array
    {
        $this->app['auth']->forgetGuards();

        return ['Authorization' => 'Bearer '.$user->createToken('test')->plainTextToken];
    }

    private function makePassenger(): User
    {
        $this->seq++;
        $user = User::create([
            'name' => "Passenger {$this->seq}",
            'email' => "passenger{$this->seq}@example.com",
            'password_hash' => 'password123',
        ]);
        Passenger::create([
            'user_id' => $user->id,
            'full_name' => "Passenger {$this->seq}",
            'passenger_number' => "PASS-{$this->seq}",
            'passenger_type' => 'student',
            'passenger_status' => 'active',
            'verification_status' => 'approved',
        ]);

        return $user;
    }

    private function makeDriverUser(): User
    {
        $this->seq++;

        return User::create([
            'name' => "Driver {$this->seq}",
            'email' => "driver{$this->seq}@example.com",
            'password_hash' => 'password123',
        ]);
    }

    /**
     * Build a route with two ordered stops, a driver, and an active shuttle
     * of the given capacity assigned to that driver + route.
     *
     * @return array{route: Route, stopA: Stop, stopB: Stop, driver: Driver, driverUser: User, shuttle: Shuttle}
     */
    private function setupRouteWithDriver(int $capacity): array
    {
        $route = Route::create([
            'name' => 'South Bound '.++$this->seq,
            'start_location' => 'Talamban',
            'end_location' => 'UP Cebu',
            'distance_km' => 8.0,
            'estimated_duration_minutes' => 20,
            'is_active' => true,
        ]);

        $stopA = Stop::create([
            'route_id' => $route->id,
            'name' => 'Stop A (early)',
            'sequence' => 1,
            'latitude' => 10.3157,
            'longitude' => 123.8854,
            'is_active' => true,
        ]);

        $stopB = Stop::create([
            'route_id' => $route->id,
            'name' => 'Stop B (late)',
            'sequence' => 2,
            'latitude' => 10.3200,
            'longitude' => 123.8900,
            'is_active' => true,
        ]);

        $driverUser = $this->makeDriverUser();
        $driver = Driver::create([
            'user_id' => $driverUser->id,
            'full_name' => 'Ben Dela Cruz',
            'license_number' => 'LIC-'.$this->seq,
            'is_available' => true,
            'driver_status' => 'active',
        ]);

        $shuttle = Shuttle::create([
            'shuttle_code' => 'SH-'.$this->seq,
            'shuttle_type' => 'van',
            'plate_number' => 'PLT-'.$this->seq,
            'capacity' => $capacity,
            'is_active' => true,
            'status' => 'active',
            'route_id' => $route->id,
            'driver_id' => $driver->id,
        ]);

        return compact('route', 'stopA', 'stopB', 'driver', 'driverUser', 'shuttle');
    }

    private function book(User $passenger, Route $route, Stop $pickup, Stop $dropoff)
    {
        return $this->withHeaders($this->authHeaders($passenger))
            ->postJson('/api/pickup-requests', [
                'route_id' => $route->id,
                'pickup_stop_id' => $pickup->id,
                'dropoff_stop_id' => $dropoff->id,
            ]);
    }

    public function test_capacity_gated_auto_accept_then_queue_overflow(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 2);

        // First two bookings fit the 2-seat shuttle → auto-accepted.
        $this->book($this->makePassenger(), $env['route'], $env['stopA'], $env['stopB'])
            ->assertStatus(201);
        $this->book($this->makePassenger(), $env['route'], $env['stopA'], $env['stopB'])
            ->assertStatus(201);

        // Third overflows capacity → stays pending with a queue position.
        $this->book($this->makePassenger(), $env['route'], $env['stopB'], $env['stopA'])
            ->assertStatus(201);

        $accepted = PickupRequest::where('route_id', $env['route']->id)
            ->where('status', 'accepted')->count();
        $pending = PickupRequest::where('route_id', $env['route']->id)
            ->where('status', 'pending')->get();

        $this->assertSame(2, $accepted, 'Two seats should auto-accept.');
        $this->assertCount(1, $pending, 'Third booking should wait in queue.');
        $this->assertNotNull($pending->first()->queue_position);
    }

    public function test_driver_queue_endpoint_returns_hybrid_ordered_feed(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 5);

        // Booked late-sequence stop first, early-sequence stop second.
        $late = $this->makePassenger();
        $early = $this->makePassenger();
        $this->book($late, $env['route'], $env['stopB'], $env['stopA'])->assertStatus(201);
        $this->book($early, $env['route'], $env['stopA'], $env['stopB'])->assertStatus(201);

        $res = $this->withHeaders($this->authHeaders($env['driverUser']))
            ->getJson('/api/driver/queue');

        $res->assertOk()
            ->assertJsonPath('shuttle.shuttle_code', $env['shuttle']->shuttle_code)
            ->assertJsonPath('shuttle.capacity', 5)
            ->assertJsonPath('route.name', $env['route']->name)
            ->assertJsonPath('counts.capacity', 5);

        // Hybrid order: Stop A (sequence 1) must come before Stop B (sequence 2),
        // even though the Stop B passenger booked first (FCFS only breaks ties).
        $queue = $res->json('queue');
        $this->assertSame('Stop A (early)', $queue[0]['pickup_stop']);
        $this->assertSame('Stop B (late)', $queue[1]['pickup_stop']);
    }

    public function test_board_marks_passenger_in_progress(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 3);
        $this->book($this->makePassenger(), $env['route'], $env['stopA'], $env['stopB'])
            ->assertStatus(201);

        $request = PickupRequest::where('route_id', $env['route']->id)->firstOrFail();

        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson("/api/pickup-requests/{$request->id}/board")
            ->assertOk();

        $this->assertSame('in_progress', $request->fresh()->status);
    }

    public function test_no_show_frees_seat_and_promotes_next_in_queue(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 1);

        // First booking takes the only seat (accepted); second waits (pending).
        $this->book($this->makePassenger(), $env['route'], $env['stopA'], $env['stopB'])
            ->assertStatus(201);
        $this->book($this->makePassenger(), $env['route'], $env['stopB'], $env['stopA'])
            ->assertStatus(201);

        $accepted = PickupRequest::where('route_id', $env['route']->id)
            ->where('status', 'accepted')->firstOrFail();
        $queued = PickupRequest::where('route_id', $env['route']->id)
            ->where('status', 'pending')->firstOrFail();

        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson("/api/pickup-requests/{$accepted->id}/no-show")
            ->assertOk();

        $this->assertSame('cancelled', $accepted->fresh()->status);
        $this->assertSame('accepted', $queued->fresh()->status, 'Next in queue should be promoted.');
        $this->assertNull($queued->fresh()->queue_position);
    }

    public function test_decline_also_promotes_next_in_queue(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 1);
        $this->book($this->makePassenger(), $env['route'], $env['stopA'], $env['stopB'])
            ->assertStatus(201);
        $this->book($this->makePassenger(), $env['route'], $env['stopB'], $env['stopA'])
            ->assertStatus(201);

        $accepted = PickupRequest::where('route_id', $env['route']->id)
            ->where('status', 'accepted')->firstOrFail();
        $queued = PickupRequest::where('route_id', $env['route']->id)
            ->where('status', 'pending')->firstOrFail();

        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson("/api/pickup-requests/{$accepted->id}/decline")
            ->assertOk();

        $this->assertSame('cancelled', $accepted->fresh()->status);
        $this->assertSame('accepted', $queued->fresh()->status);
    }

    public function test_driver_cannot_act_on_request_outside_their_route(): void
    {
        $mine = $this->setupRouteWithDriver(capacity: 3);
        $other = $this->setupRouteWithDriver(capacity: 3);

        $this->book($this->makePassenger(), $other['route'], $other['stopA'], $other['stopB'])
            ->assertStatus(201);
        $foreign = PickupRequest::where('route_id', $other['route']->id)->firstOrFail();

        $this->withHeaders($this->authHeaders($mine['driverUser']))
            ->patchJson("/api/pickup-requests/{$foreign->id}/board")
            ->assertStatus(403);
    }

    public function test_driver_can_toggle_on_off_duty_status(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 3);

        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson('/api/driver/status', ['on_duty' => false])
            ->assertOk()
            ->assertJsonPath('on_duty', false)
            ->assertJsonPath('driver_status', 'offline');

        $this->assertSame(0, (int) $env['driver']->fresh()->is_available);
        $this->assertSame('offline', $env['driver']->fresh()->driver_status);

        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson('/api/driver/status', ['on_duty' => true])
            ->assertOk()
            ->assertJsonPath('on_duty', true)
            ->assertJsonPath('driver_status', 'active');

        $this->assertSame(1, (int) $env['driver']->fresh()->is_available);
    }

    public function test_toggling_duty_syncs_the_assigned_shuttle_status(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 3);

        // Off duty → shuttle goes offline so the web Live Map drops its marker.
        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson('/api/driver/status', ['on_duty' => false])
            ->assertOk();
        $this->assertSame('offline', $env['shuttle']->fresh()->status);

        // Back on duty → shuttle is active again.
        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson('/api/driver/status', ['on_duty' => true])
            ->assertOk();
        $this->assertSame('active', $env['shuttle']->fresh()->status);
        $this->assertNotNull($env['shuttle']->fresh()->last_seen_at);
    }

    public function test_driver_status_requires_boolean(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 3);

        $this->withHeaders($this->authHeaders($env['driverUser']))
            ->patchJson('/api/driver/status', [])
            ->assertStatus(422);
    }

    public function test_driver_notifications_returns_driver_audience_log(): void
    {
        $env = $this->setupRouteWithDriver(capacity: 3);

        // Booking writes a driver-audience "is waiting at..." log entry.
        $this->book($this->makePassenger(), $env['route'], $env['stopA'], $env['stopB'])
            ->assertStatus(201);

        // An unrelated passenger-only notification must NOT leak to drivers.
        Notification::create([
            'title' => 'For passengers',
            'message' => 'Passenger-only blast',
            'type' => 'announcement',
            'audience' => 'passengers',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $res = $this->withHeaders($this->authHeaders($env['driverUser']))
            ->getJson('/api/driver/notifications');

        $res->assertOk();
        $messages = collect($res->json('data'))->pluck('message');
        $this->assertTrue($messages->contains(fn ($m) => str_contains($m, 'is waiting at')));
        $this->assertFalse($messages->contains('Passenger-only blast'));
    }
}
