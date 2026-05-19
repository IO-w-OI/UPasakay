<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display a listing of admins.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Admin::class);

        $query = Admin::with('user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%$search%");
            });
        }

        if ($request->filled('access_level')) {
            $accessLevel = (int) $request->access_level;
            if (in_array($accessLevel, [1, 2])) {
                $query->where('access_level', $accessLevel);
            }
        }

        $admins = $query->latest('updated_at')
            ->paginate(25)
            ->withQueryString();

        $admins->getCollection()->transform(function ($admin) {
            return [
                'id' => $admin->user_id,
                'email' => $admin->user->email,
                'access_level' => $admin->access_level,
                'access_level_label' => $admin->access_level === 2 ? 'Super Admin' : 'Admin',
                'created_at' => $admin->created_at->copy()->timezone('Asia/Manila')->format('Y-m-d H:i'),
                'updated_at' => $admin->updated_at->copy()->timezone('Asia/Manila')->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('Admins/Index', [
            'admins' => $admins,
            'filters' => [
                'search' => $request->input('search'),
                'access_level' => $request->input('access_level'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new admin.
     */
    public function create()
    {
        $this->authorize('create', Admin::class);

        return Inertia::render('Admins/Create');
    }

    /**
     * Store a newly created admin in storage.
     */
    public function store(StoreAdminRequest $request)
    {
        $validated = $request->validated();

        // Create user account
        $user = User::create([
            'email' => $validated['email'],
            'password_hash' => $validated['password'],
        ]);

        // Create admin record
        Admin::create([
            'user_id' => $user->id,
            'access_level' => $validated['access_level'],
        ]);

        return redirect()->route('admins.index')
            ->with('success', 'Admin account created successfully.');
    }

    /**
     * Display the specified admin.
     */
    public function show(Admin $admin)
    {
        $this->authorize('view', $admin);

        return response()->json([
            'admin' => [
                'id' => $admin->user_id,
                'email' => $admin->user->email,
                'access_level' => $admin->access_level,
                'access_level_label' => $admin->access_level === 2 ? 'Super Admin' : 'Admin',
                'created_at' => $admin->created_at,
                'updated_at' => $admin->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified admin.
     */
    public function edit(Admin $admin)
    {
        $this->authorize('view', $admin);

        return Inertia::render('Admins/Edit', [
            'admin' => [
                'id' => $admin->user_id,
                'email' => $admin->user->email,
                'access_level' => $admin->access_level,
            ],
            'canUpdate' => $this->canUpdate($admin),
            'canDelete' => auth()->user()->admin->isSuperAdmin() && auth()->user()->id !== $admin->user_id,
        ]);
    }

    /**
     * Update the specified admin in storage.
     */
    public function update(UpdateAdminRequest $request, Admin $admin)
    {
        $this->authorize('update', $admin);

        $validated = $request->validated();

        // Update email if changed
        if ($validated['email'] !== $admin->user->email) {
            $admin->user->update([
                'email' => $validated['email'],
            ]);
        }

        // Update password if provided
        if ($request->filled('password')) {
            $admin->user->update([
                'password_hash' => $validated['password'],
            ]);
        }

        // Update access level
        $admin->update([
            'access_level' => $validated['access_level'],
        ]);

        return redirect()->route('admins.index')
            ->with('success', 'Admin account updated successfully.');
    }

    /**
     * Remove the specified admin from storage.
     */
    public function destroy(Admin $admin)
    {
        $this->authorize('delete', $admin);

        // Delete the associated user
        $admin->user->delete();

        // Admin record will cascade delete
        $admin->delete();

        return redirect()->route('admins.index')
            ->with('success', 'Admin account deleted successfully.');
    }

    /**
     * Check if the current user can update the admin.
     */
    protected function canUpdate(Admin $admin): bool
    {
        $currentUser = auth()->user();

        if (! $currentUser->admin || ! $currentUser->admin->isSuperAdmin()) {
            return false;
        }

        // Cannot downgrade oneself
        if ($currentUser->id === $admin->user_id) {
            return false;
        }

        return true;
    }
}
