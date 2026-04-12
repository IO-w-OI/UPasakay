<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3';
import { Eye, EyeOff, AlertTriangle } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

interface Admin {
    id: number;
    email: string;
    access_level: number;
}

interface PageProps {
    admin: Admin;
    canUpdate: boolean;
    canDelete: boolean;
}

const props = defineProps<PageProps>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Admin Accounts', href: '/admins' },
    { title: 'Edit', href: `/admins/${props.admin.id}/edit` },
];

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const showDeleteModal = ref(false);
const deleteCountdown = ref(5);
let deleteInterval: ReturnType<typeof setInterval> | null = null;

const form = useForm({
    email: props.admin.email,
    password: '',
    password_confirmation: '',
    access_level: String(props.admin.access_level),
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

const formValid = computed(() => {
    const passwordValid = form.password === ''
        ? true
        : form.password.length >= 8 && form.password === form.password_confirmation;
    return (
        form.email.trim() !== '' &&
        passwordValid &&
        form.access_level !== ''
    );
});

const submit = () => {
    form.patch(`/admins/${props.admin.id}`, {
        onSuccess: () => form.reset(),
    });
};

const startDelete = () => {
    deleteCountdown.value = 5;
    showDeleteModal.value = true;
    deleteInterval = setInterval(() => {
        deleteCountdown.value--;
        if (deleteCountdown.value <= 0 && deleteInterval) {
            clearInterval(deleteInterval);
            deleteInterval = null;
        }
    }, 1000);
};

const confirmDelete = () => {
    if (deleteCountdown.value > 0) return;
    const deleteForm = useForm({});
    deleteForm.delete(`/admins/${props.admin.id}`);
};

const cancelDelete = () => {
    showDeleteModal.value = false;
    if (deleteInterval) {
        clearInterval(deleteInterval);
        deleteInterval = null;
    }
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Edit Admin Account" />

        <div class="max-w-2xl">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Edit Admin Account</h1>
                <p class="mt-1 text-sm text-gray-600">Update administrator details and permissions</p>
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
                                Password <span class="text-gray-500 text-xs">(leave blank to keep current)</span>
                            </label>
                            <button
                                v-if="form.password === ''"
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
                                placeholder="Enter a new password (optional)"
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
                    <div v-if="form.password !== ''">
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div class="relative">
                            <input
                                id="password_confirmation"
                                v-model="form.password_confirmation"
                                :type="showPasswordConfirmation ? 'text' : 'password'"
                                placeholder="Confirm new password"
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
                            :disabled="!canUpdate"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="2">Super Admin (Full access)</option>
                            <option value="1">Admin (Limited access)</option>
                        </select>
                        <p v-if="!canUpdate" class="mt-2 text-xs text-amber-600">
                            You cannot modify the access level of this account.
                        </p>
                        <p v-else class="mt-2 text-xs text-gray-500">
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
                            {{ form.processing ? 'Saving...' : 'Save Changes' }}
                        </button>
                        <button
                            v-if="canDelete"
                            type="button"
                            @click="startDelete"
                            class="px-4 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition"
                        >
                            Delete
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div class="bg-white rounded-lg p-6 max-w-sm">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle :size="24" class="text-red-600" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">Delete Admin Account</h3>
                </div>
                <p class="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{{ admin.email }}</strong>? This action cannot be undone.
                </p>
                <div class="flex gap-3">
                    <button
                        @click="cancelDelete"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        @click="confirmDelete"
                        :disabled="deleteCountdown > 0"
                        :class="{
                            'flex-1 px-4 py-2 rounded-lg text-white transition': true,
                            'bg-red-600 hover:bg-red-700': deleteCountdown <= 0,
                            'bg-gray-300 cursor-not-allowed': deleteCountdown > 0,
                        }"
                    >
                        {{ deleteCountdown > 0 ? `Delete (${deleteCountdown}s)` : 'Delete Account' }}
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
