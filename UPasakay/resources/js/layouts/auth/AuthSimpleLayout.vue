<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { dashboard } from '@/routes';

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <div class="relative flex min-h-svh items-center justify-center">
        <!-- Background bus image with red overlay -->
        <div class="absolute inset-0 z-0">
            <img
                src="/images/background-bus.png"
                alt="Background"
                class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-[#a02020]/70"></div>
        </div>

        <!-- Login card -->
        <div class="relative z-10 w-full max-w-[460px] rounded-2xl bg-white p-10 shadow-xl">
            <div class="flex flex-col items-center gap-4">
                <!-- Logo -->
                <Link :href="dashboard()" class="flex flex-col items-center gap-1">
                    <img
                        src="/images/logo.png"
                        alt="UPasakay Logo"
                        class="h-32 w-auto"
                    />
                    <span class="text-sm font-medium text-gray-600">Admin Portal</span>
                </Link>

                <!-- Title & description -->
                <div class="space-y-1 text-center">
                    <p class="text-sm font-semibold text-gray-800">{{ title }}</p>
                    <p class="text-sm text-gray-500">{{ description }}</p>
                </div>
            </div>

            <div class="mt-6">
                <slot />
            </div>

            <p class="mt-6 text-center text-xs text-gray-400">
                v1.0.0 - UPasakay Admin System
            </p>
        </div>
    </div>
</template>
