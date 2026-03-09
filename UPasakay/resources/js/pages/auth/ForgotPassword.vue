<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';
import InputError from '@/components/InputError.vue';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { login } from '@/routes';
import { email } from '@/routes/password';

defineProps<{
    status?: string;
}>();
</script>

<template>
    <AuthLayout
        title="Forgot password"
        description="Enter your email to receive a password reset link"
    >
        <Head title="Forgot password" />

        <div
            v-if="status"
            class="mb-4 text-center text-sm font-medium text-green-600"
        >
            {{ status }}
        </div>

        <div class="space-y-6">
            <Form v-bind="email.form()" v-slot="{ errors, processing }">
                <div class="grid gap-2">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autocomplete="off"
                        autofocus
                        placeholder="email@example.com"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="errors.email" />
                </div>

                <div class="my-6">
                    <button
                        type="submit"
                        class="w-full rounded-full bg-[#E8962E] py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#d4851f] disabled:opacity-60"
                        :disabled="processing"
                        data-test="email-password-reset-link-button"
                    >
                        <span class="flex items-center justify-center gap-2">
                            <Spinner v-if="processing" />
                            Email password reset link
                        </span>
                    </button>
                </div>
            </Form>

            <div class="text-center text-sm text-gray-500">
                Or, return to
                <Link :href="login()" class="font-medium text-[#6B7C3A] hover:text-[#E8962E]">log in</Link>
            </div>
        </div>
    </AuthLayout>
</template>
