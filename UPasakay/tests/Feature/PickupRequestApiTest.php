<?php

namespace Tests\Feature;

use App\Models\Passenger;
use App\Models\PickupRequest;
use App\Models\Route;
use App\Models\Stop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PickupRequestApiTest extends TestCase
{
    use RefreshDatabase;

    private function createAuthenticatedUser(array $overrides = []): User
    {
        static $sequence = 0;
        $sequence++;

        $user = User::create([
            'name' => 'Passenger ' . $sequence,
            'email' => "passenger{$sequence}@example.com",
            'password_hash' => Hash::make('password123'),
        ]);

        Passenger::create(array_merge([
            'user_id' => $user->id,
            'full_name' => 'Passenger ' . $sequence,
            'passenger_number' => 'PASS-' . $sequence,
            'passenger_type' => 'student',
            'passenger_status' => 'active',
            'verification_status' => 'approved',
        ], $overrides));

        return $user;
    }

    private function getAuthHeaders(User $user): array
    {
        $token = $user->createToken('test')->plainTextToken;
        return ['Authorization' => "Bearer {$token}"];
    }

    private function setupTestRoute(): array
    {
        $route = Route::create([
            'name' => 'Test Route',
            'start_location' => 'Start Point',
            'end_location' => 'End Point',
            'description' => 'A test route',
        ]);

        $pickupStop = Stop::create([
            'route_id' => $route->id,
            'name' => 'Pickup Stop',
            'latitude' => 10.3157,
            'longitude' => 123.8854,
            'sequence' => 1,
        ]);

        $dropoffStop = Stop::create([
            'route_id' => $route->id,
            'name' => 'Dropoff Stop',
            'latitude' => 10.3200,
            'longitude' => 123.8900,
            'sequence' => 2,
        ]);

        return [
            'route' => $route,
            'pickup_stop' => $pickupStop,
            'dropoff_stop' => $dropoffStop,
        ];
    }

    public function test_create_booking_uses_authenticated_user_not_client_user_id(): void
    {
        $authenticatedUser = $this->createAuthenticatedUser();
        $otherUser = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        // Try to create booking with different user_id in payload (should be ignored)
        $response = $this->withHeaders($this->getAuthHeaders($authenticatedUser))
            ->postJson('/api/pickup-requests', [
                'user_id' => $otherUser->id, // This should be ignored
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(201);
        
        // Verify the booking belongs to the authenticated user, not the one in the payload
        $this->assertDatabaseHas('pickup_requests', [
            'user_id' => $authenticatedUser->id,
            'route_id' => $testData['route']->id,
        ]);

        $this->assertDatabaseMissing('pickup_requests', [
            'user_id' => $otherUser->id,
            'route_id' => $testData['route']->id,
        ]);
    }

    public function test_create_booking_requires_authentication(): void
    {
        $testData = $this->setupTestRoute();

        $response = $this->postJson('/api/pickup-requests', [
            'route_id' => $testData['route']->id,
            'pickup_stop_id' => $testData['pickup_stop']->id,
            'dropoff_stop_id' => $testData['dropoff_stop']->id,
        ]);

        $response->assertStatus(401);
    }

    public function test_create_booking_requires_valid_passenger_profile(): void
    {
        $user = User::create([
            'name' => 'No Passenger User',
            'email' => 'no-passenger@example.com',
            'password_hash' => Hash::make('password123'),
        ]);
        // Note: no passenger profile created

        $testData = $this->setupTestRoute();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.passenger', ['User does not have a valid passenger profile.']);
    }

    public function test_create_booking_requires_active_passenger_status(): void
    {
        $user = $this->createAuthenticatedUser(['passenger_status' => 'inactive']);
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Your passenger account is not active.')
            ->assertJsonPath('passenger_status', 'inactive');
    }

    public function test_create_booking_requires_verified_passenger_status(): void
    {
        $user = $this->createAuthenticatedUser(['verification_status' => 'pending']);
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Your account is not yet verified.')
            ->assertJsonPath('verification_status', 'pending');
    }

    public function test_create_booking_with_valid_data(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('route_id', $testData['route']->id)
            ->assertJsonPath('pickup_stop_id', $testData['pickup_stop']->id)
            ->assertJsonPath('dropoff_stop_id', $testData['dropoff_stop']->id)
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('pickup_requests', [
            'user_id' => $user->id,
            'route_id' => $testData['route']->id,
            'status' => 'pending',
        ]);
    }

    public function test_duplicate_booking_blocked_for_pending_status(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        // Create first booking
        $response1 = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response1->assertStatus(201);

        // Try to create duplicate booking
        $response2 = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response2->assertStatus(422)
            ->assertJsonPath('errors.booking', ['You already have an active booking for this route and stops. Please complete or cancel your existing booking first.']);
    }

    public function test_duplicate_booking_blocked_for_accepted_status(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        // Create first booking with accepted status
        PickupRequest::create([
            'user_id' => $user->id,
            'route_id' => $testData['route']->id,
            'pickup_stop_id' => $testData['pickup_stop']->id,
            'dropoff_stop_id' => $testData['dropoff_stop']->id,
            'status' => 'accepted',
        ]);

        // Try to create duplicate booking
        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.booking', ['You already have an active booking for this route and stops. Please complete or cancel your existing booking first.']);
    }

    public function test_duplicate_booking_blocked_for_in_progress_status(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        // Create first booking with in_progress status
        PickupRequest::create([
            'user_id' => $user->id,
            'route_id' => $testData['route']->id,
            'pickup_stop_id' => $testData['pickup_stop']->id,
            'dropoff_stop_id' => $testData['dropoff_stop']->id,
            'status' => 'in_progress',
        ]);

        // Try to create duplicate booking
        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.booking', ['You already have an active booking for this route and stops. Please complete or cancel your existing booking first.']);
    }

    public function test_new_booking_allowed_after_completed_status(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        // Create first booking with completed status
        PickupRequest::create([
            'user_id' => $user->id,
            'route_id' => $testData['route']->id,
            'pickup_stop_id' => $testData['pickup_stop']->id,
            'dropoff_stop_id' => $testData['dropoff_stop']->id,
            'status' => 'completed',
        ]);

        // Should be able to create new booking for same route/stops
        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'pending');

        // Verify two bookings exist now
        $this->assertEquals(2, PickupRequest::where('user_id', $user->id)->count());
    }

    public function test_new_booking_allowed_after_cancelled_status(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        // Create first booking with cancelled status
        PickupRequest::create([
            'user_id' => $user->id,
            'route_id' => $testData['route']->id,
            'pickup_stop_id' => $testData['pickup_stop']->id,
            'dropoff_stop_id' => $testData['dropoff_stop']->id,
            'status' => 'cancelled',
        ]);

        // Should be able to create new booking for same route/stops
        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'pending');

        // Verify two bookings exist now
        $this->assertEquals(2, PickupRequest::where('user_id', $user->id)->count());
    }

    public function test_different_routes_allow_multiple_bookings(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData1 = $this->setupTestRoute();

        // Create second route
        $testData2 = $this->setupTestRoute();

        // Create booking on first route
        $response1 = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData1['route']->id,
                'pickup_stop_id' => $testData1['pickup_stop']->id,
                'dropoff_stop_id' => $testData1['dropoff_stop']->id,
            ]);

        $response1->assertStatus(201);

        // Should be able to create booking on different route
        $response2 = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData2['route']->id,
                'pickup_stop_id' => $testData2['pickup_stop']->id,
                'dropoff_stop_id' => $testData2['dropoff_stop']->id,
            ]);

        $response2->assertStatus(201);

        // Verify both bookings exist
        $this->assertEquals(2, PickupRequest::where('user_id', $user->id)->count());
    }

    public function test_validation_requires_route_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('route_id');
    }

    public function test_validation_requires_pickup_stop_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('pickup_stop_id');
    }

    public function test_validation_requires_dropoff_stop_id(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('dropoff_stop_id');
    }

    public function test_validation_checks_route_exists(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => 99999, // Non-existent route
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('route_id');
    }

    public function test_validation_checks_pickup_stop_exists(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => 99999, // Non-existent stop
                'dropoff_stop_id' => $testData['dropoff_stop']->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('pickup_stop_id');
    }

    public function test_validation_checks_dropoff_stop_exists(): void
    {
        $user = $this->createAuthenticatedUser();
        $testData = $this->setupTestRoute();

        $response = $this->withHeaders($this->getAuthHeaders($user))
            ->postJson('/api/pickup-requests', [
                'route_id' => $testData['route']->id,
                'pickup_stop_id' => $testData['pickup_stop']->id,
                'dropoff_stop_id' => 99999, // Non-existent stop
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('dropoff_stop_id');
    }
}
