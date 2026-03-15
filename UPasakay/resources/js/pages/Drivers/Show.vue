<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { Mail, Key, Bus, ChevronLeft, User, Star } from 'lucide-vue-next';
import { ref } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const props = defineProps<{
    driver: {
        id: number; employee_id: string; full_name: string; license: string;
        status: string; route: string; shuttle: string; email: string;
        last_login: string; total_sessions: number; total_pickups: number; avg_rating: string;
    };
    activityLog: Array<{ date: string; event: string; route: string; time: string }>;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',    href: dashboard().url },
    { title: 'Drivers', href: '/drivers' },
    { title: props.driver.employee_id, href: `/drivers/${props.driver.id}` },
];

const activeTab = ref<'activity' | 'shuttles' | 'stats'>('activity');

const statusBadge = (s: string) =>
    ({ active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-500' }[s] ?? 'bg-gray-100 text-gray-500');

const routeBadge = (r: string) =>
    ({ South: 'bg-green-100 text-green-700', North: 'bg-blue-100 text-blue-700', 'Cebu City': 'bg-orange-100 text-orange-700' }[r] ?? 'bg-gray-100 text-gray-600');
</script>

<template>
    <Head :title="`Driver — ${driver.full_name}`" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <Link href="/drivers" class="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100">
                        <ChevronLeft class="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">{{ driver.full_name }}</h1>
                        <p class="text-xs text-gray-400">{{ driver.employee_id }}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        Deactivate
                    </button>
                    <button class="rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000]">
                        Edit
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">

                <!-- Profile Card -->
                <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-4">
                    <!-- Avatar -->
                    <div class="mb-4 flex flex-col items-center gap-2">
                        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-400">
                            {{ driver.full_name.charAt(0) }}
                        </div>
                        <h2 class="text-lg font-bold text-gray-900">{{ driver.full_name }}</h2>
                        <p class="text-sm text-gray-400">Driver {{ driver.employee_id }}</p>
                    </div>

                    <div class="space-y-3 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">Route</span>
                            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(driver.route)">
                                {{ driver.route }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">Shuttle</span>
                            <span class="font-medium text-gray-800">{{ driver.shuttle }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">Status</span>
                            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusBadge(driver.status)">
                                {{ driver.status }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">License</span>
                            <span class="font-medium text-gray-800">{{ driver.license }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500">Email</span>
                            <span class="text-gray-600 truncate max-w-36">{{ driver.email }}</span>
                        </div>
                    </div>

                    <hr class="my-4 border-gray-100" />

                    <div class="space-y-1.5 text-sm">
                        <p class="text-gray-500">Last Login</p>
                        <p class="font-medium text-gray-800">{{ driver.last_login }}</p>
                    </div>

                        <div class="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div class="rounded-xl bg-gray-50 p-3">
                            <p class="text-lg font-bold text-gray-900">{{ driver.total_sessions }}</p>
                            <p class="text-[10px] text-gray-400">Sessions</p>
                        </div>
                        <div class="rounded-xl bg-gray-50 p-3">
                            <p class="text-lg font-bold text-gray-900">{{ driver.total_pickups }}</p>
                            <p class="text-[10px] text-gray-400">Pickups</p>
                        </div>
                        <div class="rounded-xl bg-gray-50 p-3">
                            <p class="text-lg font-bold text-gray-900">{{ driver.avg_rating }}</p>
                                <p class="text-lg font-bold text-gray-900">{{ driver.avg_rating }} <Star class="inline-block h-5 w-5 text-yellow-500 ml-2" /></p>
                                <p class="mt-1 text-sm text-gray-400">Avg Rating</p>
                        </div>
                    </div>

                    <div class="mt-5 space-y-2">
                        <button class="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Mail class="h-4 w-4 text-gray-400" /> Send Message
                        </button>
                        <button class="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Key class="h-4 w-4 text-gray-400" /> Reset Password
                        </button>
                        <button class="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Bus class="h-4 w-4 text-gray-400" /> Reassign Shuttle
                        </button>
                    </div>
                </div>

                <!-- Right panel -->
                <div class="rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-8">
                    <!-- Tabs -->
                    <div class="flex border-b border-gray-100">
                        <button
                            v-for="tab in [{ key: 'activity', label: 'Activity Log' }, { key: 'shuttles', label: 'Assigned Shuttles' }, { key: 'stats', label: 'Stats' }]"
                            :key="tab.key"
                            @click="activeTab = tab.key as any"
                            class="px-5 py-3 text-sm font-medium transition"
                            :class="activeTab === tab.key
                                ? 'border-b-2 border-[#8B0000] text-[#8B0000]'
                                : 'text-gray-500 hover:text-gray-700'"
                        >
                            {{ tab.label }}
                        </button>
                    </div>

                    <!-- Activity Log Tab -->
                    <div v-if="activeTab === 'activity'" class="p-5">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-400">
                                    <th class="pb-2 pr-4">Date</th>
                                    <th class="pb-2 pr-4">Event</th>
                                    <th class="pb-2 pr-4">Time</th>
                                    <th class="pb-2">Route</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(log, i) in activityLog" :key="i"
                                    class="border-b border-gray-50 last:border-0">
                                    <td class="py-2.5 pr-4 text-gray-500">{{ log.date }}</td>
                                    <td class="py-2.5 pr-4 text-gray-800">{{ log.event }}</td>
                                    <td class="py-2.5 pr-4 text-gray-400">{{ log.time }}</td>
                                    <td class="py-2.5">
                                        <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="routeBadge(log.route)">
                                            {{ log.route }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="activityLog.length === 0">
                                    <td colspan="4" class="py-8 text-center text-sm text-gray-400">No activity recorded yet.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Assigned Shuttles Tab -->
                    <div v-if="activeTab === 'shuttles'" class="p-5">
                        <div class="text-center py-10 text-sm text-gray-400">
                            Currently assigned to shuttle <span class="font-semibold text-gray-700">{{ driver.shuttle }}</span>
                        </div>
                    </div>

                    <!-- Stats Tab -->
                    <div v-if="activeTab === 'stats'" class="grid grid-cols-2 gap-4 p-5">
                        <div class="rounded-xl bg-gray-50 p-4 text-center">
                            <p class="text-3xl font-bold text-gray-900">{{ driver.total_pickups }}</p>
                            <p class="mt-1 text-sm text-gray-400">Total Pickups</p>
                        </div>
                        <div class="rounded-xl bg-gray-50 p-4 text-center">
                            <p class="text-3xl font-bold text-gray-900">{{ driver.total_sessions }}</p>
                            <p class="mt-1 text-sm text-gray-400">Total Sessions</p>
                        </div>
                        <div class="rounded-xl bg-gray-50 p-4 text-center">
                            <p class="text-3xl font-bold text-gray-900">{{ driver.avg_rating }} <Star class="inline-block h-5 w-5 text-yellow-500 ml-2" /></p>
                            <p class="mt-1 text-sm text-gray-400">Avg Rating</p>
                        </div>
                        <div class="rounded-xl bg-gray-50 p-4 text-center">
                            <p class="text-3xl font-bold text-green-600">Active</p>
                            <p class="mt-1 text-sm text-gray-400">Current Status</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
