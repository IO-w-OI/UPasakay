<?php

namespace Tests\Feature\Auth;

use App\Models\Passenger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PassengerAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful passenger registration
     */
    public function test_passenger_can_register_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Passenger account created successfully',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'email'],
                    'token',
                ],
            ]);

        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'email' => 'passenger@example.com',
        ]);

        // Verify passenger profile was created
        $user = User::where('email', 'passenger@example.com')->first();
        $this->assertDatabaseHas('passengers', [
            'user_id' => $user->id,
        ]);

        // Verify token was created
        $this->assertNotNull($response->json('data.token'));
    }

    /**
     * Test registration fails with missing email
     */
    public function test_registration_fails_without_email(): void
    {
        $response = $this->postJson('/api/register', [
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    /**
     * Test registration fails with invalid email
     */
    public function test_registration_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'not-an-email',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    /**
     * Test registration fails with duplicate email
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::create([
            'email' => 'existing@example.com',
            'password_hash' => 'existingpassword',
        ]);

        $response = $this->postJson('/api/register', [
            'email' => 'existing@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    /**
     * Test registration fails without password
     */
    public function test_registration_fails_without_password(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test registration fails with mismatched password confirmation
     */
    public function test_registration_fails_with_mismatched_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'DifferentPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test registration fails with weak password (no uppercase)
     */
    public function test_registration_fails_with_weak_password_no_uppercase(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password' => 'securepassword123!',
            'password_confirmation' => 'securepassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test registration fails with weak password (no numbers)
     */
    public function test_registration_fails_with_weak_password_no_numbers(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword!',
            'password_confirmation' => 'SecurePassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test registration fails with weak password (no special characters)
     */
    public function test_registration_fails_with_weak_password_no_symbols(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123',
            'password_confirmation' => 'SecurePassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test successful passenger login
     */
    public function test_passenger_can_login_with_valid_credentials(): void
    {
        $user = User::create([
            'email' => 'passenger@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'email'],
                    'token',
                ],
            ]);

        // Verify returned user data
        $this->assertEquals($user->id, $response->json('data.user.id'));
        $this->assertEquals('passenger@example.com', $response->json('data.user.email'));
    }

    /**
     * Test login fails with non-existent email
     */
    public function test_login_fails_with_non_existent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'SecurePassword123!',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    /**
     * Test login fails with incorrect password
     */
    public function test_login_fails_with_incorrect_password(): void
    {
        User::create([
            'email' => 'passenger@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'passenger@example.com',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    /**
     * Test login fails without email
     */
    public function test_login_fails_without_email(): void
    {
        $response = $this->postJson('/api/login', [
            'password' => 'SecurePassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    /**
     * Test login fails without password
     */
    public function test_login_fails_without_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'passenger@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test login revokes all previous tokens
     */
    public function test_login_revokes_previous_tokens(): void
    {
        $user = User::create([
            'email' => 'passenger@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        // Create a token from previous login
        $oldToken = $user->createToken('mobile-app')->plainTextToken;

        // Verify token exists
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => 'App\\Models\\User',
        ]);

        $oldTokenCount = $user->tokens()->count();
        $this->assertEquals(1, $oldTokenCount);

        // Login again
        $response = $this->postJson('/api/login', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123!',
        ]);

        $response->assertStatus(200);

        // Verify old token was deleted and new token created (should be exactly 1 token)
        $newTokenCount = $user->refresh()->tokens()->count();
        $this->assertEquals(1, $newTokenCount);

        // Verify the token in response can be used
        $newToken = $response->json('data.token');
        $this->assertNotEmpty($newToken);
    }

    /**
     * Test successful logout
     */
    public function test_passenger_can_logout(): void
    {
        $user = User::create([
            'email' => 'passenger@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful',
            ]);

        // Verify token was deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => 'App\\Models\\User',
        ]);
    }

    /**
     * Test logout fails without authentication
     */
    public function test_logout_fails_without_authentication(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    /**
     * Test revoke all tokens functionality
     */
    public function test_passenger_can_revoke_all_tokens(): void
    {
        $user = User::create([
            'email' => 'passenger@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        // Create multiple tokens
        $token1 = $user->createToken('mobile-app-1')->plainTextToken;
        $token2 = $user->createToken('mobile-app-2')->plainTextToken;
        $token3 = $user->createToken('mobile-app-3')->plainTextToken;

        // Verify tokens exist in database
        $this->assertDatabaseCount('personal_access_tokens', 3);

        // Revoke all tokens
        $response = $this->withToken($token1)
            ->postJson('/api/revoke-all-tokens');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'All tokens revoked successfully',
            ]);

        // Verify all tokens are deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => 'App\\Models\\User',
        ]);
    }

    /**
     * Test revoke all tokens fails without authentication
     */
    public function test_revoke_all_tokens_fails_without_authentication(): void
    {
        $response = $this->postJson('/api/revoke-all-tokens');

        $response->assertStatus(401);
    }

    /**
     * Test token is included in response and is usable
     */
    public function test_returned_token_is_usable(): void
    {
        $user = User::create([
            'email' => 'passenger@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123!',
        ]);

        $token = $response->json('data.token');

        // Use the token to access a protected endpoint
        $logoutResponse = $this->withToken($token)
            ->postJson('/api/logout');

        $logoutResponse->assertStatus(200);
    }

    /**
     * Test response structure consistency
     */
    public function test_response_structure_is_consistent(): void
    {
        // Register response structure
        $registerResponse = $this->postJson('/api/register', [
            'email' => 'passenger@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ]);

        $registerResponse->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => ['id', 'email'],
                'token',
            ],
        ]);

        // Login response structure
        User::create([
            'email' => 'login@example.com',
            'password_hash' => bcrypt('SecurePassword123!'),
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'SecurePassword123!',
        ]);

        $loginResponse->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => ['id', 'email'],
                'token',
            ],
        ]);
    }

    /**
     * Test error response includes validation errors
     */
    public function test_validation_errors_are_included_in_response(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'invalid-email',
            'password' => 'weak',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'email',
                    'password',
                ],
            ]);
    }
}
