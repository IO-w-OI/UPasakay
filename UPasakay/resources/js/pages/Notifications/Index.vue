<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Bell, Calendar, Search } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',          href: dashboard().url },
    { title: 'Notifications', href: '/notifications' },
];

const props = defineProps<{
    routes: string[];
    notificationLog: Array<{ time: string; type: string; label: string; target: string; status: string; date: string }>;
    scheduledNotifications: Array<{ id: number; title: string; schedule: string; target: string; auto: boolean; active: boolean }>;
}>();

// ── Send form ──────────────────────────────────────────────────────────────
const form = ref({
    type: 'Shuttle Availability',
    targetRoute: 'all',
    message: '',
});
const charCount = computed(() => form.value.message.length);

const preview = computed(() => {
    if (!form.value.message) return '🔔 UPasakay\nYour notification preview will appear here.';
    const route = form.value.targetRoute === 'all' ? 'All Routes' : form.value.targetRoute;
    return `🔔 UPasakay\n${form.value.message}\n(${route})`;
});

const send = () => { alert('Notification sent!'); form.value.message = ''; };

// ── Log search ─────────────────────────────────────────────────────────────
const logSearch = ref('');
const typeFilter = ref('All');
const filteredLog = computed(() =>
    props.notificationLog.filter(n =>
        (typeFilter.value === 'All' || n.type === typeFilter.value) &&
        (!logSearch.value || n.label.toLowerCase().includes(logSearch.value.toLowerCase()) ||
            n.target.toLowerCase().includes(logSearch.value.toLowerCase()))
    )
);

const typeIcon = (t: string) =>
    ({ schedule: '📅', delay: '🔔', change: '⚠️' }[t] ?? '🔔');
</script>

<template>
    <Head title="Notifications" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-6">
            <h1 class="mb-5 text-2xl font-bold text-gray-900">Notifications</h1>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">

                <!-- Left: Send Announcement -->
                <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 class="mb-4 font-semibold text-gray-800">Send Announcement</h2>

                    <label class="mb-1 block text-sm font-medium text-gray-700">Type *</label>
                    <select v-model="form.type"
                        class="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                        <option>Shuttle Availability</option>
                        <option>Route Delay</option>
                        <option>Route Change</option>
                        <option>Service Announcement</option>
                    </select>

                    <label class="mb-2 block text-sm font-medium text-gray-700">Target Route *</label>
                    <div class="mb-4 space-y-2">
                        <label v-for="opt in [{ val: 'all', label: 'All Routes' }, { val: 'North', label: 'North Route' }, { val: 'South', label: 'South Route' }, { val: 'Cebu City', label: 'Cebu City Route' }]"
                            :key="opt.val" class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="radio" v-model="form.targetRoute" :value="opt.val" class="accent-[#8B0000]" />
                            {{ opt.label }}
                        </label>
                    </div>

                    <label class="mb-1 block text-sm font-medium text-gray-700">Message (optional)</label>
                    <div class="relative mb-4">
                        <textarea v-model="form.message" maxlength="160" rows="4"
                            placeholder="e.g. Shuttle SH-001 will be delayed by 15 minutes due to road works."
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000] resize-none"></textarea>
                        <span class="absolute bottom-2 right-3 text-xs text-gray-400">{{ charCount }}/160</span>
                    </div>

                    <!-- Preview -->
                    <label class="mb-2 block text-sm font-medium text-gray-700">Preview</label>
                    <div class="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-line">
                        {{ preview }}
                    </div>

                    <div class="flex justify-end gap-3">
                        <button @click="form.message = ''"
                            class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button @click="send"
                            class="flex items-center gap-2 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000]">
                            <Bell class="h-4 w-4" /> Send Now
                        </button>
                    </div>
                </div>

                <!-- Right: Notification Log + Scheduled -->
                <div class="space-y-5">
                    <!-- Log -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 class="mb-3 font-semibold text-gray-800">Notification Log</h2>
                        <div class="mb-3 flex gap-2">
                            <div class="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                <Search class="h-4 w-4 text-gray-400 shrink-0" />
                                <input v-model="logSearch" placeholder="Search…"
                                    class="flex-1 text-sm outline-none placeholder:text-gray-400" />
                            </div>
                            <select v-model="typeFilter"
                                class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none">
                                <option value="All">Type: All</option>
                                <option value="schedule">Schedule</option>
                                <option value="delay">Delay</option>
                                <option value="change">Change</option>
                            </select>
                        </div>

                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-xs font-medium uppercase text-gray-400 border-b border-gray-100">
                                    <th class="pb-2 pr-3">Time</th>
                                    <th class="pb-2 pr-3">Type</th>
                                    <th class="pb-2 pr-3">Target</th>
                                    <th class="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(n, i) in filteredLog" :key="i"
                                    class="border-b border-gray-50 last:border-0">
                                    <td class="py-2.5 pr-3 text-gray-500 text-xs">
                                        <div>{{ n.time }}</div>
                                        <div class="text-gray-400">{{ n.date }}</div>
                                    </td>
                                    <td class="py-2.5 pr-3">
                                        <span class="text-sm">{{ typeIcon(n.type) }} {{ n.label }}</span>
                                    </td>
                                    <td class="py-2.5 pr-3 text-gray-600 text-sm">{{ n.target }}</td>
                                    <td class="py-2.5">
                                        <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">✅ Sent</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Scheduled -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 class="mb-3 font-semibold text-gray-800">Scheduled Notifications</h2>
                        <div class="space-y-3">
                            <div v-for="sn in scheduledNotifications" :key="sn.id"
                                class="rounded-xl border border-gray-100 p-4">
                                <div class="mb-1 flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <Calendar class="h-4 w-4 text-gray-400" />
                                        <span class="font-medium text-gray-800 text-sm">{{ sn.title }}</span>
                                    </div>
                                    <span :class="sn.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                                        class="rounded-full px-2 py-0.5 text-xs font-medium">
                                        {{ sn.active ? '✅ Active' : 'Paused' }}
                                    </span>
                                </div>
                                <p class="mb-2 text-xs text-gray-400">{{ sn.schedule }} · Target: {{ sn.target }} · {{ sn.auto ? 'Auto' : 'Manual' }}</p>
                                <div class="flex gap-2">
                                    <button class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">Edit</button>
                                    <button class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">Pause</button>
                                </div>
                            </div>
                        </div>
                        <button class="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                            + Add Scheduled Notification
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
