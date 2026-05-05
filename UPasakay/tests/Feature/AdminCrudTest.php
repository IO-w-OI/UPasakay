<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $regularAdmin;

    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a super admin user
        $this->superAdmin = User::factory()->create(['email' => 'super@example.com']);
        Admin::factory()->create([
            'user_id' => $this->superAdmin->id,
            'access_level' => 2,
        ]);

        // Create a regular admin user
        $this->regularAdmin = User::factory()->create(['email' => 'admin@example.com']);
        Admin::factory()->create([
            'user_id' => $this->regularAdmin->id,
            'access_level' => 1,
        ]);

        // Create a regular user (passenger)
        $this->regularUser = User::factory()->create(['email' => 'user@example.com']);
    }

    // ── LIST TESTS ──────────────────────────────────────────────────────────

    public function test_super_admin_can_view_admin_list()
    {
        $response = $this->actingAs($this->superAdmin)->get('/admins');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admins/Index')
            ->has('admins.data')
        );
    }

    public function test_regular_admin_cannot_view_admin_list()
    {
        $response = $this->actingAs($this->regularAdmin)->get('/admins');

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_view_admin_list()
    {
        $response = $this->get('/admins');

        $response->assertRedirect('/login');
    }

    public function test_admin_list_shows_correct_data()
    {
        $response = $this->actingAs($this->superAdmin)->get('/admins');

        $response->assertInertia(fn ($page) => $page
            ->has('admins.data', 2)
            ->where('admins.data.0.email', 'super@example.com')
            ->where('admins.data.0.access_level_label', 'Super Admin')
            ->where('admins.data.1.email', 'admin@example.com')
            ->where('admins.data.1.access_level_label', 'Admin')
        );
    }

    public function test_admin_list_can_be_searched()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/admins?search=super');

        $response->assertInertia(fn ($page) => $page
            ->has('admins.data', 1)
            ->where('admins.data.0.email', 'super@example.com')
        );
    }

    public function test_admin_list_can_be_filtered_by_access_level()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/admins?access_level=2');

        $response->assertInertia(fn ($page) => $page
            ->has('admins.data', 1)
            ->where('admins.data.0.access_level', 2)
        );
    }

    // ── CREATE TESTS ────────────────────────────────────────────────────────

    public function test_super_admin_can_view_create_form()
    {
        $response = $this->actingAs($this->superAdmin)->get('/admins/create');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admins/Create')
        );
    }

    public function test_regular_admin_cannot_view_create_form()
    {
        $response = $this->actingAs($this->regularAdmin)->get('/admins/create');

        $response->assertForbidden();
    }

    public function test_super_admin_can_create_admin()
    {
        $response = $this->actingAs($this->superAdmin)->post('/admins', [
            'email' => 'newadmin@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'access_level' => 1,
        ]);

        $response->assertRedirect('/admins');
        $this->assertDatabaseHas('users', ['email' => 'newadmin@example.com']);
        $this->assertDatabaseHas('admins', ['access_level' => 1]);
    }

    public function test_cannot_create_admin_with_duplicate_email()
    {
        $response = $this->actingAs($this->superAdmin)->post('/admins', [
            'email' => 'super@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'access_level' => 1,
        ]);

        $response->assertInvalid('email');
    }

    public function test_cannot_create_admin_with_weak_password()
    {
        $response = $this->actingAs($this->superAdmin)->post('/admins', [
            'email' => 'weak@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
            'access_level' => 1,
        ]);

        $response->assertInvalid('password');
    }

    public function test_cannot_create_admin_with_mismatched_passwords()
    {
        $response = $this->actingAs($this->superAdmin)->post('/admins', [
            'email' => 'mismatch@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword456!',
            'access_level' => 1,
        ]);

        $response->assertInvalid('password');
    }

    public function test_cannot_create_admin_with_invalid_access_level()
    {
        $response = $this->actingAs($this->superAdmin)->post('/admins', [
            'email' => 'invalid@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'access_level' => 99,
        ]);

        $response->assertInvalid('access_level');
    }

    // ── UPDATE TESTS ────────────────────────────────────────────────────────

    public function test_super_admin_can_view_edit_form()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get("/admins/{$this->regularAdmin->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admins/Edit')
            ->where('admin.email', 'admin@example.com')
            ->where('canUpdate', true)
            ->where('canDelete', true)
        );
    }

    public function test_super_admin_cannot_view_own_edit_form_with_update()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get("/admins/{$this->superAdmin->id}/edit");

        $response->assertInertia(fn ($page) => $page
            ->where('canUpdate', false)
            ->where('canDelete', false)
        );
    }

    public function test_regular_admin_cannot_view_edit_form()
    {
        $response = $this->actingAs($this->regularAdmin)
            ->get("/admins/{$this->superAdmin->id}/edit");

        $response->assertForbidden();
    }

    public function test_super_admin_can_update_admin_email()
    {
        $response = $this->actingAs($this->superAdmin)->patch("/admins/{$this->regularAdmin->id}", [
            'email' => 'newemail@example.com',
            'password' => '',
            'password_confirmation' => '',
            'access_level' => 1,
        ]);

        $response->assertRedirect('/admins');
        $this->assertDatabaseHas('users', [
            'id' => $this->regularAdmin->id,
            'email' => 'newemail@example.com',
        ]);
    }

    public function test_super_admin_can_update_admin_password()
    {
        $response = $this->actingAs($this->superAdmin)->patch("/admins/{$this->regularAdmin->id}", [
            'email' => 'admin@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
            'access_level' => 1,
        ]);

        $response->assertRedirect('/admins');
        $user = User::find($this->regularAdmin->id);
        $this->assertTrue(password_verify('NewPassword123!', $user->password_hash));
    }

    public function test_super_admin_can_upgrade_admin_to_super_admin()
    {
        $response = $this->actingAs($this->superAdmin)->patch("/admins/{$this->regularAdmin->id}", [
            'email' => 'admin@example.com',
            'password' => '',
            'password_confirmation' => '',
            'access_level' => 2,
        ]);

        $response->assertRedirect('/admins');
        $this->assertDatabaseHas('admins', [
            'user_id' => $this->regularAdmin->id,
            'access_level' => 2,
        ]);
    }

    public function test_super_admin_cannot_downgrade_themselves()
    {
        $response = $this->actingAs($this->superAdmin)->patch("/admins/{$this->superAdmin->id}", [
            'email' => 'super@example.com',
            'password' => '',
            'password_confirmation' => '',
            'access_level' => 1,
        ]);

        $response->assertForbidden();
    }

    public function test_cannot_update_admin_with_duplicate_email()
    {
        $response = $this->actingAs($this->superAdmin)->patch("/admins/{$this->regularAdmin->id}", [
            'email' => 'super@example.com',
            'password' => '',
            'password_confirmation' => '',
            'access_level' => 1,
        ]);

        $response->assertInvalid('email');
    }

    public function test_can_update_admin_with_existing_email()
    {
        $response = $this->actingAs($this->superAdmin)->patch("/admins/{$this->regularAdmin->id}", [
            'email' => 'admin@example.com',
            'password' => '',
            'password_confirmation' => '',
            'access_level' => 1,
        ]);

        $response->assertRedirect('/admins');
    }

    // ── DELETE TESTS ────────────────────────────────────────────────────────

    public function test_super_admin_can_delete_admin()
    {
        $adminToDelete = User::factory()->create();
        Admin::factory()->create([
            'user_id' => $adminToDelete->id,
            'access_level' => 1,
        ]);

        $response = $this->actingAs($this->superAdmin)->delete("/admins/{$adminToDelete->id}");

        $response->assertRedirect('/admins');
        $this->assertDatabaseMissing('users', ['id' => $adminToDelete->id]);
        $this->assertDatabaseMissing('admins', ['user_id' => $adminToDelete->id]);
    }

    public function test_super_admin_cannot_delete_themselves()
    {
        $response = $this->actingAs($this->superAdmin)->delete("/admins/{$this->superAdmin->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $this->superAdmin->id]);
    }

    public function test_regular_admin_cannot_delete_admin()
    {
        $response = $this->actingAs($this->regularAdmin)->delete("/admins/{$this->superAdmin->id}");

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_delete_admin()
    {
        $response = $this->delete("/admins/{$this->superAdmin->id}");

        $response->assertRedirect('/login');
    }
}
