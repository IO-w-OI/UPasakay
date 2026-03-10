<script setup lang="ts">
import { ref } from 'vue';
import { Form, Head } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';
import InputError from '@/components/InputError.vue';
import { Spinner } from '@/components/ui/spinner';
import AuthBase from '@/layouts/AuthLayout.vue';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

defineProps<{
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}>();

const showPassword = ref(false);
</script>

<template>
    <AuthBase
        title="Sign in to manage the shuttle service"
        description=""
    >
        <Head title="Login-Admin" />

        <div
            v-if="status"
            class="mb-4 text-center text-sm font-medium text-green-600"
        >
            {{ status }}
        </div>

        <Form
            v-bind="store.form()"
            :reset-on-success="['password']"
            v-slot="{ errors, processing }"
            class="flex flex-col gap-5"
        >
            <div class="grid gap-5">
                <!-- Email -->
                <div class="grid gap-2">
                    <label for="email" class="text-sm font-semibold text-gray-800">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autofocus
                        :tabindex="1"
                        autocomplete="email"
                        placeholder="admin@upasakay.edu.ph"
                        class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                    />
                    <InputError :message="errors.email" />
                </div>

                <!-- Password -->
                <div class="grid gap-2">
                    <label for="password" class="text-sm font-semibold text-gray-800">Password</label>
                    <div class="relative">
                        <input
                            id="password"
                            :type="showPassword ? 'text' : 'password'"
                            name="password"
                            required
                            :tabindex="2"
                            autocomplete="current-password"
                            placeholder="Password"
                            class="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#E8962E] focus:ring-2 focus:ring-[#E8962E]/20"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            @click="showPassword = !showPassword"
                        >
                            <!-- Eye open -->
                            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <!-- Eye closed -->
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                            </svg>
                        </button>
                    </div>
                    <InputError :message="errors.password" />

                    <div class="flex justify-end">
                        <Link
                            v-if="canResetPassword"
                            :href="request()"
                            :tabindex="5"
                            class="text-sm font-medium text-[#6B7C3A] hover:text-[#E8962E]"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <!-- Submit -->
                <button
                    type="submit"
                    :tabindex="4"
                    :disabled="processing"
                    data-test="login-button"
                    class="mt-1 w-full rounded-full bg-[#E8962E] py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#d4851f] disabled:opacity-60"
                >
                    <span class="flex items-center justify-center gap-2">
                        <Spinner v-if="processing" />
                        LOG IN
                    </span>
                </button>
            </div>
        </Form>
    </AuthBase>
</template>
