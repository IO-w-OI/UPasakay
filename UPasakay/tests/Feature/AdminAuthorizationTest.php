<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $regularAdmin;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a super admin
        $this->superAdmin = User::factory()->create();
        Admin::factory()->create([
            'user_id' => $this->superAdmin->id,
            'access_level' => 2,
        ]);

        // Create a regular admin
        $this->regularAdmin = User::factory()->create();
        Admin::factory()->create([
            'user_id' => $this->regularAdmin->id,
            'access_level' => 1,
        ]);

        // Create a regular user
        $this->otherUser = User::factory()->create();
    }

    // ── VIEW AUTHORIZATION ──────────────────────────────────────────────────

    public function test_super_admin_can_view_any_admin()
    {
        $this->assertTrue($this->superAdmin->admin->isSuperAdmin());
        $this->assertTrue(auth()->setUser($this->superAdmin)->user()->can('viewAny', Admin::class));
    }

    public function test_regular_admin_cannot_view_any_admin()
    {
        $this->assertFalse($this->regularAdmin->admin->isSuperAdmin());
        $this->assertFalse(auth()->setUser($this->regularAdmin)->user()->can('viewAny', Admin::class));
    }

    public function test_user_without_admin_cannot_view_any_admin()
    {
        $this->assertNull($this->otherUser->admin);
        $this->assertFalse(auth()->setUser($this->otherUser)->user()->can('viewAny', Admin::class));
    }

    public function test_super_admin_can_view_specific_admin()
    {
        auth()->setUser($this->superAdmin);
        $this->assertTrue($this->superAdmin->can('view', $this->regularAdmin->admin));
    }

    // ── CREATE AUTHORIZATION ────────────────────────────────────────────────

    public function test_super_admin_can_create_admin()
    {
        auth()->setUser($this->superAdmin);
        $this->assertTrue($this->superAdmin->can('create', Admin::class));
    }

    public function test_regular_admin_cannot_create_admin()
    {
        auth()->setUser($this->regularAdmin);
        $this->assertFalse($this->regularAdmin->can('create', Admin::class));
    }

    public function test_user_without_admin_cannot_create_admin()
    {
        auth()->setUser($this->otherUser);
        $this->assertFalse($this->otherUser->can('create', Admin::class));
    }

    // ── UPDATE AUTHORIZATION ────────────────────────────────────────────────

    public function test_super_admin_can_update_other_admin()
    {
        auth()->setUser($this->superAdmin);
        $this->assertTrue($this->superAdmin->can('update', $this->regularAdmin->admin));
    }

    public function test_super_admin_cannot_update_themselves()
    {
        auth()->setUser($this->superAdmin);
        $this->assertFalse($this->superAdmin->can('update', $this->superAdmin->admin));
    }

    public function test_regular_admin_cannot_update_any_admin()
    {
        auth()->setUser($this->regularAdmin);
        $this->assertFalse($this->regularAdmin->can('update', $this->superAdmin->admin));
        $this->assertFalse($this->regularAdmin->can('update', $this->regularAdmin->admin));
    }

    // ── DELETE AUTHORIZATION ────────────────────────────────────────────────

    public function test_super_admin_can_delete_other_admin()
    {
        auth()->setUser($this->superAdmin);
        $this->assertTrue($this->superAdmin->can('delete', $this->regularAdmin->admin));
    }

    public function test_super_admin_cannot_delete_themselves()
    {
        auth()->setUser($this->superAdmin);
        $this->assertFalse($this->superAdmin->can('delete', $this->superAdmin->admin));
    }

    public function test_regular_admin_cannot_delete_any_admin()
    {
        auth()->setUser($this->regularAdmin);
        $this->assertFalse($this->regularAdmin->can('delete', $this->superAdmin->admin));
        $this->assertFalse($this->regularAdmin->can('delete', $this->regularAdmin->admin));
    }

    // ── ADMIN METHODS ───────────────────────────────────────────────────────

    public function test_is_super_admin_method()
    {
        $this->assertTrue($this->superAdmin->admin->isSuperAdmin());
        $this->assertFalse($this->regularAdmin->admin->isSuperAdmin());
    }

    public function test_is_regular_admin_method()
    {
        $this->assertFalse($this->superAdmin->admin->isRegularAdmin());
        $this->assertTrue($this->regularAdmin->admin->isRegularAdmin());
    }

    // ── ADMIN TO USER RELATIONSHIP ──────────────────────────────────────────

    public function test_admin_has_user_relationship()
    {
        $this->assertNotNull($this->superAdmin->admin->user);
        $this->assertEquals($this->superAdmin->id, $this->superAdmin->admin->user->id);
    }

    public function test_user_has_admin_relationship()
    {
        $this->assertNotNull($this->superAdmin->admin());
        $this->assertEquals($this->superAdmin->id, $this->superAdmin->admin->user_id);
    }

    public function test_non_admin_user_has_no_admin()
    {
        $this->assertNull($this->otherUser->admin());
    }
}
