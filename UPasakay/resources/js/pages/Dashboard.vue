<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import {
    Bus, Users, ClipboardList, Star, Eye,
    Map, BarChart2, CheckCircle2,
    MapPin, CheckCheck, Clock, Bell, UserCircle2, XCircle, Pin,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

// ── Props from DashboardController ───────────────────────────────────────────
const props = defineProps<{
    stats: {
        activeShuttles: number;
        driversOnline: number;
        pendingRequests: number;
        avgFeedback: string;
    };
    shuttles: Array<{
        shuttle_code: string;
        driver: string;
        route: string;
        status: string;
        last_seen: string;
    }>;
    pickupsPerRoute: Array<{ name: string; count: number }>;
    maxPickups: number;
    successPct: number;
    failedPct: number;
    recentActivity: Array<{ icon: string; text: string; time: string }>;
}>();

// ── Breadcrumbs ───────────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

// ── Live datetime ─────────────────────────────────────────────────────────────
const now = ref(new Date());
let timer: ReturnType<typeof setInterval>;
onMounted(() => { timer = setInterval(() => { now.value = new Date(); }, 60_000); });
onUnmounted(() => clearInterval(timer));

const currentDatetime = computed(() => {
    const d = now.value;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        + ' '
        + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
});

// ── Donut chart (SVG) ─────────────────────────────────────────────────────────
const RADIUS = 60;
const CIRC   = 2 * Math.PI * RADIUS; // ≈ 377

const successDash = computed(() => (props.successPct / 100) * CIRC);
const failedDash  = computed(() => (props.failedPct  / 100) * CIRC);
// Start failed arc after the success arc
const failedOffset = computed(() => CIRC - successDash.value);

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColor = (status: string) =>
    ({ active: 'bg-green-100 text-green-700', idle: 'bg-orange-100 text-orange-700', offline: 'bg-gray-100 text-gray-500' }[status] ?? 'bg-gray-100 text-gray-500');

const routeColor = (route: string) =>
    ({ South: 'bg-green-100 text-green-700', North: 'bg-blue-100 text-blue-700', 'Cebu City': 'bg-orange-100 text-orange-700' }[route] ?? 'bg-gray-100 text-gray-600');

const activityIconMap: Record<string, unknown> = {
    bus:   Bus,
    check: CheckCheck,
    clock: Clock,
    bell:  Bell,
    user:  UserCircle2,
    x:     XCircle,
};
const activityIconComponent = (icon: string) => activityIconMap[icon] ?? Pin;

// ── Mock shuttle positions on the mini-map ────────────────────────────────────
const mapShuttles = [
    { code: 'SH-001', x: 30,  y: 55 },
    { code: 'SH-002', x: 55,  y: 30 },
    { code: 'SH-003', x: 75,  y: 60 },
];
const mapPins = [
    { x: 45, y: 65 },
    { x: 62, y: 45 },
];
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <!-- ── Stats cards ──────────────────────────────────────────────── -->
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <!-- Active Shuttles -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500">
                        <Bus class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-gray-900">{{ stats.activeShuttles }}</div>
                    <div class="mt-1 text-sm text-gray-400">Active Shuttles</div>
                    <div class="mt-2 text-xs font-medium text-green-500">↑ 1 vs yesterday</div>
                </div>

                <!-- Drivers Online -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                        <Users class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-gray-900">{{ stats.driversOnline }}</div>
                    <div class="mt-1 text-sm text-gray-400">Drivers Online</div>
                    <div class="mt-2 text-xs font-medium text-orange-500">↓ 2 vs yesterday</div>
                </div>

                <!-- Pending Requests -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                        <ClipboardList class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-gray-900">{{ stats.pendingRequests }}</div>
                    <div class="mt-1 text-sm text-gray-400">Pending Requests</div>
                    <div class="mt-2 text-xs font-medium text-orange-500">↑ 4 vs yesterday</div>
                </div>

                <!-- Avg Feedback -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-500">
                        <Star class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-gray-900">{{ stats.avgFeedback }}</div>
                    <div class="mt-1 text-sm text-gray-400">Avg Feedback Today</div>
                    <div class="mt-2 text-xs font-medium text-green-500">↑ 0.3 vs yesterday</div>
                </div>
            </div>

            <!-- ── Live Map + Recent Activity ──────────────────────────────── -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">

                <!-- Live Map Mini -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-7">
                    <div class="mb-3 flex items-center justify-between">
                        <h2 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Map class="h-4 w-4 text-gray-400" /> Live Map (Mini)
                        </h2>
                        <button class="text-xs font-medium text-blue-500 hover:underline">View Full Map &rsaquo;</button>
                    </div>

                    <!-- Simple grid map -->
                    <div class="relative h-44 w-full overflow-hidden rounded-xl border border-gray-100 bg-[#eef4ee]">
                        <!-- Grid lines -->
                        <svg class="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="25%" height="25%" patternUnits="objectBoundingBox">
                                    <path d="M 0 0 L 0 100% M 0 0 L 100% 0" stroke="#c8dfc8" stroke-width="1" fill="none"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>

                        <!-- Shuttle markers -->
                        <div
                            v-for="sh in mapShuttles"
                            :key="sh.code"
                            class="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green-600 text-xs text-white shadow-md"
                            :style="{ left: sh.x + '%', top: sh.y + '%' }"
                            :title="sh.code"
                        >
                            <Bus class="h-4 w-4" />
                        </div>

                        <!-- Stop pins -->
                        <div
                            v-for="(pin, i) in mapPins"
                            :key="i"
                            class="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-full items-center justify-center text-red-500"
                            :style="{ left: pin.x + '%', top: pin.y + '%' }"
                        >
                            <MapPin class="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-5">
                    <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <ClipboardList class="h-4 w-4 text-gray-400" /> Recent Activity
                    </h2>
                    <ul class="space-y-3">
                        <li
                            v-for="(item, i) in recentActivity"
                            :key="i"
                            class="flex items-start gap-3"
                        >
                            <component :is="activityIconComponent(item.icon)" class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <div class="flex-1 min-w-0">
                                <p class="truncate text-xs text-gray-700">{{ item.text }}</p>
                                <p class="text-[11px] text-gray-400">{{ item.time }}</p>
                            </div>
                        </li>
                    </ul>
                    <button class="mt-3 text-xs font-medium text-blue-500 hover:underline">View All Activity &rsaquo;</button>
                </div>
            </div>

            <!-- ── Shuttle Status Overview ───────────────────────────────────── -->
            <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Bus class="h-4 w-4 text-gray-400" /> Shuttle Status Overview
                    </h2>
                    <button class="text-xs font-medium text-blue-500 hover:underline">View All &rsaquo;</button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                                <th class="pb-2 pr-4">Shuttle ID</th>
                                <th class="pb-2 pr-4">Driver</th>
                                <th class="pb-2 pr-4">Route</th>
                                <th class="pb-2 pr-4">Status</th>
                                <th class="pb-2 pr-4">Last Seen</th>
                                <th class="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="s in shuttles"
                                :key="s.shuttle_code"
                                class="border-b border-gray-50 last:border-0"
                            >
                                <td class="py-3 pr-4 font-semibold text-gray-800">{{ s.shuttle_code }}</td>
                                <td class="py-3 pr-4 text-gray-600">{{ s.driver }}</td>
                                <td class="py-3 pr-4">
                                    <span
                                        class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        :class="routeColor(s.route)"
                                    >{{ s.route }}</span>
                                </td>
                                <td class="py-3 pr-4">
                                    <span
                                        class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                                        :class="statusColor(s.status)"
                                    >{{ s.status.charAt(0).toUpperCase() + s.status.slice(1) }}</span>
                                </td>
                                <td class="py-3 pr-4 text-gray-400 text-xs">{{ s.last_seen }}</td>
                                <td class="py-3">
                                    <button class="text-gray-300 hover:text-gray-500">
                                        <Eye class="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ── Charts row ────────────────────────────────────────────────── -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">

                <!-- Pickups per Route (horizontal bar chart) -->
                <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <BarChart2 class="h-4 w-4 text-gray-400" /> Pickups per Route
                    </h2>
                    <div class="space-y-4">
                        <div v-for="r in pickupsPerRoute" :key="r.name">
                            <div class="mb-1 flex items-center justify-between text-xs">
                                <span class="text-gray-500">{{ r.name }}</span>
                            </div>
                            <div class="h-6 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    class="h-full rounded-full bg-[#1a6b2f] transition-all duration-500"
                                    :style="{ width: ((r.count / maxPickups) * 100).toFixed(1) + '%' }"
                                ></div>
                            </div>
                        </div>
                        <!-- X-axis labels -->
                        <div class="flex justify-between text-[10px] text-gray-400">
                            <span>0</span>
                            <span>{{ Math.round(maxPickups * 0.25) }}</span>
                            <span>{{ Math.round(maxPickups * 0.5) }}</span>
                            <span>{{ Math.round(maxPickups * 0.75) }}</span>
                            <span>{{ maxPickups }}</span>
                        </div>
                    </div>
                </div>

                <!-- Boarding Success Rate (donut) -->
                <div class="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 class="mb-4 w-full text-left flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <CheckCircle2 class="h-4 w-4 text-gray-400" /> Boarding Success Rate
                    </h2>
                    <svg width="160" height="160" viewBox="0 0 160 160" class="my-2">
                        <!-- Background ring -->
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#f0f0f0" stroke-width="20"/>
                        <!-- Success arc (green) -->
                        <circle
                            cx="80" cy="80" r="60"
                            fill="none"
                            stroke="#22c55e"
                            stroke-width="20"
                            :stroke-dasharray="`${successDash} ${CIRC}`"
                            stroke-dashoffset="94"
                            stroke-linecap="round"
                        />
                        <!-- Failed arc (red) -->
                        <circle
                            cx="80" cy="80" r="60"
                            fill="none"
                            stroke="#ef4444"
                            stroke-width="20"
                            :stroke-dasharray="`${failedDash} ${CIRC}`"
                            :stroke-dashoffset="-(successDash - 94)"
                            stroke-linecap="round"
                        />
                        <!-- Center label -->
                        <text x="80" y="76" text-anchor="middle" class="font-bold" font-size="22" fill="#111827" font-weight="700">{{ successPct }}%</text>
                        <text x="80" y="96" text-anchor="middle" font-size="11" fill="#9ca3af">Success</text>
                    </svg>

                    <div class="mt-2 flex gap-6">
                        <div class="flex items-center gap-1.5 text-xs text-gray-600">
                            <span class="inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            Success — {{ successPct }}%
                        </div>
                        <div class="flex items-center gap-1.5 text-xs text-gray-600">
                            <span class="inline-block h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            Failed — {{ failedPct }}%
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </AppLayout>
</template>

