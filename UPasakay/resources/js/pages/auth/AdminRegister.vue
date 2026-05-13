<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { reactive, ref } from 'vue';
import InputError from '@/components/InputError.vue';
import AuthBase from '@/layouts/AuthLayout.vue';

defineProps<{
    requiresInviteCode: boolean;
}>();

const form = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    invite_code: '',
});

const errors = ref<Record<string, string[]>>({});
const processing = ref(false);
const serverMessage = ref('');

const submit = async () => {
    processing.value = true;
    errors.value = {};
    serverMessage.value = '';

    try {
        const response = await fetch('/api/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422 && data.errors) {
                errors.value = data.errors;
            } else {
                serverMessage.value = data.message ?? 'Unable to register right now.';
            }

            return;
        }

        window.location.href = data.redirect_to ?? '/login?admin_registered=1';
    } catch {
        serverMessage.value = 'Network error. Please try again.';
    } finally {
        processing.value = false;
    }
};

const firstError = (key: string) => errors.value[key]?.[0] ?? '';
</script>

<template>
    <AuthBase title="Create an admin account" description="Register a web admin profile for UPasakay.">
        <Head title="Admin Register" />

        <form class="flex flex-col gap-5" @submit.prevent="submit">
            <div class="grid gap-5">
                <div class="grid gap-2">
                    <label for="name" class="text-sm font-semibold text-gray-800">Name</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        required
                        autocomplete="name"
                        placeholder="Admin name"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="firstError('name')" />
                </div>

                <div class="grid gap-2">
                    <label for="email" class="text-sm font-semibold text-gray-800">Email Address</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        required
                        autocomplete="email"
                        placeholder="admin@upasakay.edu.ph"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="firstError('email')" />
                </div>

                <div class="grid gap-2">
                    <label for="password" class="text-sm font-semibold text-gray-800">Password</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        required
                        autocomplete="new-password"
                        placeholder="Password"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="firstError('password')" />
                </div>

                <div class="grid gap-2">
                    <label for="password_confirmation" class="text-sm font-semibold text-gray-800">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        v-model="form.password_confirmation"
                        type="password"
                        required
                        autocomplete="new-password"
                        placeholder="Confirm password"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="firstError('password_confirmation')" />
                </div>

                <div v-if="requiresInviteCode" class="grid gap-2">
                    <label for="invite_code" class="text-sm font-semibold text-gray-800">Invite Code</label>
                    <input
                        id="invite_code"
                        v-model="form.invite_code"
                        type="text"
                        required
                        autocomplete="off"
                        placeholder="Enter invite code"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="firstError('invite_code')" />
                </div>

                <p v-if="serverMessage" class="text-sm font-medium text-red-600">
                    {{ serverMessage }}
                </p>

                <button
                    type="submit"
                    :disabled="processing"
                    class="mt-1 w-full rounded-full bg-[#E8962E] py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#d4851f] disabled:opacity-60"
                >
                    {{ processing ? 'Creating account...' : 'Sign Up' }}
                </button>
            </div>

            <div class="text-center text-sm">
                <span class="text-gray-600">Already have an admin account?</span>
                <Link href="/login" class="ml-1 font-medium text-[#6B7C3A] hover:text-[#E8962E]">Log In</Link>
            </div>
        </form>
    </AuthBase>
</template>
