<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { Eye, EyeOff } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Admin Accounts', href: '/admins' },
    { title: 'Create', href: '/admins/create' },
];

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const form = useForm({
    email: '',
    password: '',
    password_confirmation: '',
    access_level: '1',
});

const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let pw = '';
    const arr = new Uint32Array(16);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 16; i++) pw += chars[arr[i] % chars.length];
    form.password = pw;
    form.password_confirmation = pw;
    showPassword.value = true;
    showPasswordConfirmation.value = true;
};

const formValid = computed(() =>
    form.email.trim() !== '' &&
    form.password.length >= 8 &&
    form.password === form.password_confirmation &&
    form.access_level !== ''
);

const submit = () => {
    form.post('/admins', {
        onSuccess: () => form.reset(),
    });
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Create Admin Account" />

        <div class="max-w-2xl">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Create Admin Account</h1>
                <p class="mt-1 text-sm text-gray-600">Add a new administrator to the system</p>
            </div>

            <div class="mt-8 bg-white rounded-lg shadow p-6">
                <form @submit.prevent="submit" class="space-y-6">
                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            placeholder="admin@example.com"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p v-if="form.errors.email" class="mt-1 text-sm text-red-600">
                            {{ form.errors.email }}
                        </p>
                    </div>

                    <!-- Password -->
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label for="password" class="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <button
                                type="button"
                                @click="generatePassword"
                                class="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                Generate Password
                            </button>
                        </div>
                        <div class="relative">
                            <input
                                id="password"
                                v-model="form.password"
                                :type="showPassword ? 'text' : 'password'"
                                placeholder="Enter a secure password"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <Eye v-if="!showPassword" :size="18" />
                                <EyeOff v-else :size="18" />
                            </button>
                        </div>
                        <p v-if="form.errors.password" class="mt-1 text-sm text-red-600">
                            {{ form.errors.password }}
                        </p>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div class="relative">
                            <input
                                id="password_confirmation"
                                v-model="form.password_confirmation"
                                :type="showPasswordConfirmation ? 'text' : 'password'"
                                placeholder="Confirm password"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                @click="showPasswordConfirmation = !showPasswordConfirmation"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <Eye v-if="!showPasswordConfirmation" :size="18" />
                                <EyeOff v-else :size="18" />
                            </button>
                        </div>
                        <p v-if="form.errors.password_confirmation" class="mt-1 text-sm text-red-600">
                            {{ form.errors.password_confirmation }}
                        </p>
                    </div>

                    <!-- Access Level -->
                    <div>
                        <label for="access_level" class="block text-sm font-medium text-gray-700 mb-1">
                            Access Level
                        </label>
                        <select
                            id="access_level"
                            v-model="form.access_level"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">-- Select Access Level --</option>
                            <option value="2">Super Admin (Full access)</option>
                            <option value="1">Admin (Limited access)</option>
                        </select>
                        <p class="mt-2 text-xs text-gray-500">
                            <strong>Super Admin:</strong> Can manage all admins and system settings<br>
                            <strong>Admin:</strong> Can manage drivers, shuttles, and routes
                        </p>
                        <p v-if="form.errors.access_level" class="mt-1 text-sm text-red-600">
                            {{ form.errors.access_level }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-6">
                        <Link
                            href="/admins"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            :disabled="!formValid || form.processing"
                            :class="{
                                'flex-1 px-4 py-2 rounded-lg text-white font-medium transition': true,
                                'bg-blue-600 hover:bg-blue-700': formValid && !form.processing,
                                'bg-gray-300 cursor-not-allowed': !formValid || form.processing,
                            }"
                        >
                            {{ form.processing ? 'Creating...' : 'Create Admin' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
