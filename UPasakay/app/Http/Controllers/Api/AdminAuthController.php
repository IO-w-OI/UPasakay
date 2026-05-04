<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminAuthController extends Controller
{
    /**
     * Register a new admin account.
     */
    public function register(Request $request): JsonResponse
    {
        $inviteCode = config('admin.registration.invite_code');
        $requiresInviteCode = filled($inviteCode);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'invite_code' => $requiresInviteCode ? ['required', 'string'] : ['nullable', 'string'],
        ]);

        if ($requiresInviteCode && !hash_equals((string) $inviteCode, (string) ($validated['invite_code'] ?? ''))) {
            return response()->json([
                'message' => 'Validation error.',
                'errors' => [
                    'invite_code' => ['The invite code is invalid.'],
                ],
            ], 422);
        }

        $admin = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
            ]);

            return Admin::create([
                'user_id' => $user->id,
                'access_level' => 1,
            ]);
        });

        return response()->json([
            'message' => 'Admin account created successfully.',
            'admin_id' => $admin->user_id,
            'redirect_to' => '/login?admin_registered=1',
        ], 201);
    }
}
