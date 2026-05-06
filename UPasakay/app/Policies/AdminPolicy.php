<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\User;

class AdminPolicy
{
    /**
     * Determine if the user can view any admins.
     */
    public function viewAny(User $user): bool
    {
        return $user->admin?->isSuperAdmin() ?? false;
    }

    /**
     * Determine if the user can view a specific admin.
     */
    public function view(User $user, Admin $admin): bool
    {
        return $user->admin?->isSuperAdmin() ?? false;
    }

    /**
     * Determine if the user can create admins.
     */
    public function create(User $user): bool
    {
        return $user->admin?->isSuperAdmin() ?? false;
    }

    /**
     * Determine if the user can update an admin.
     */
    public function update(User $user, Admin $admin): bool
    {
        // Super admin can update anyone except cannot downgrade themselves
        if ($user->admin?->isSuperAdmin()) {
            if ($user->id === $admin->user_id) {
                // Prevent downgrading oneself
                return false;
            }

            return true;
        }

        return false;
    }

    /**
     * Determine if the user can delete an admin.
     */
    public function delete(User $user, Admin $admin): bool
    {
        // Super admin can delete anyone except themselves
        if ($user->admin?->isSuperAdmin()) {
            return $user->id !== $admin->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can restore an admin.
     */
    public function restore(User $user, Admin $admin): bool
    {
        return false;
    }

    /**
     * Determine if the user can permanently delete an admin.
     */
    public function forceDelete(User $user, Admin $admin): bool
    {
        return false;
    }
}
