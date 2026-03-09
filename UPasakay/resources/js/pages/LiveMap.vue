<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Map, Bus, MapPin, RefreshCw, ClipboardList, ArrowRight } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Live Map', href: '/live-map' },
];

const props = defineProps<{
    shuttles: Array<{
        id: number;
        code: string;
        driver: string;
        route: string;
        status: string;
        speed: number;
        last_seen: string;
        latitude: number | null;
        longitude: number | null;
    }>;
    pendingRequests: Array<{
        id: number;
        passenger: string;
        route: string;
        stop: string;
        time: string;
    }>;
}>();

// ── Filter / search ────────────────────────────────────────────────────────
const routeFilter = ref('All');
const searchQuery  = ref('');
const autoRefresh  = ref(true);

const routes = computed(() => {
    const unique = [...new Set(props.shuttles.map(s => s.route).filter(r => r !== '—'))];
    return ['All', ...unique];
});

const filtered = computed(() =>
    props.shuttles.filter(s => {
        const matchRoute  = routeFilter.value === 'All' || s.route === routeFilter.value;
        const matchSearch = s.code.toLowerCase().includes(searchQuery.value.toLowerCase())
            || s.driver.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchRoute && matchSearch;
    })
);

// ── Selected shuttle (for detail popup) ───────────────────────────────────
const selected = ref<typeof props.shuttles[0] | null>(null);
const selectShuttle = (s: typeof props.shuttles[0]) => {
    selected.value = selected.value?.id === s.id ? null : s;
};

// ── Helpers ────────────────────────────────────────────────────────────────
const statusDot = (status: string) =>
    ({ active: 'bg-green-500', idle: 'bg-orange-400', offline: 'bg-gray-400' }[status] ?? 'bg-gray-400');

const statusBadge = (status: string) =>
    ({ active: 'bg-green-100 text-green-700', idle: 'bg-orange-100 text-orange-700', offline: 'bg-gray-100 text-gray-500' }[status] ?? 'bg-gray-100 text-gray-500');

const routeBadge = (route: string) =>
    ({ South: 'bg-green-100 text-green-700', North: 'bg-blue-100 text-blue-700', 'Cebu City': 'bg-orange-100 text-orange-700' }[route] ?? 'bg-gray-100 text-gray-600');

const routeDot = (route: string) =>
    ({ South: 'bg-green-500', North: 'bg-blue-500', 'Cebu City': 'bg-orange-500' }[route] ?? 'bg-gray-400');

const activeCount = computed(() => props.shuttles.filter(s => s.status === 'active').length);
</script>

<template>
    <Head title="Live Map" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden p-6 pb-0">

            <!-- ── Filters row ─────────────────────────────────────────────── -->
            <div class="mb-3 flex items-center gap-2">
                <select
                    v-model="routeFilter"
                    class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none"
                >
                    <option v-for="r in routes" :key="r">{{ r }}</option>
                </select>
                <div class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search shuttle or driver…"
                        class="w-44 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                    <Map class="h-4 w-4 text-gray-400" />
                </div>
                <button
                    class="ml-auto flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700"
                    @click="autoRefresh = !autoRefresh"
                >
                    <RefreshCw class="h-4 w-4" :class="autoRefresh ? 'animate-spin [animation-duration:3s]' : ''" />
                    Auto-refresh
                </button>
            </div>

            <!-- ── Main body: map + sidebar ───────────────────────────────── -->
            <div class="flex min-h-0 flex-1 gap-4 pb-6">

                <!-- Map area -->
                <div class="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <!-- No-API placeholder map -->
                    <div class="relative flex-1 overflow-hidden bg-[#f0f4f0]">

                        <!-- SVG grid roads -->
                        <svg class="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="gridmap" width="80" height="80" patternUnits="userSpaceOnUse">
                                    <rect width="80" height="80" fill="#e8f0e8"/>
                                    <path d="M 80 0 L 0 0 L 0 80" stroke="#c8dcc8" stroke-width="0.8" fill="none"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridmap)" />

                            <!-- Stylised "roads" -->
                            <line x1="20%" y1="0"   x2="20%" y2="100%" stroke="#d0c8b0" stroke-width="5" stroke-dasharray="0"/>
                            <line x1="50%" y1="0"   x2="50%" y2="100%" stroke="#d0c8b0" stroke-width="8" />
                            <line x1="80%" y1="0"   x2="80%" y2="100%" stroke="#d0c8b0" stroke-width="5" />
                            <line x1="0"   y1="30%" x2="100%" y2="30%" stroke="#d0c8b0" stroke-width="5" />
                            <line x1="0"   y1="60%" x2="100%" y2="60%" stroke="#d0c8b0" stroke-width="8" />

                            <!-- Block fills (simulate city blocks) -->
                            <rect x="22%" y="2%"  width="26%" height="27%" rx="4" fill="#ddeace" opacity="0.6"/>
                            <rect x="52%" y="2%"  width="26%" height="27%" rx="4" fill="#ddeace" opacity="0.6"/>
                            <rect x="2%"  y="32%" width="16%" height="26%" rx="4" fill="#ddeace" opacity="0.6"/>
                            <rect x="22%" y="32%" width="26%" height="26%" rx="4" fill="#e2ebd8" opacity="0.6"/>
                            <rect x="52%" y="32%" width="26%" height="26%" rx="4" fill="#ddeace" opacity="0.6"/>
                            <rect x="2%"  y="62%" width="16%" height="30%" rx="4" fill="#ddeace" opacity="0.6"/>
                            <rect x="22%" y="62%" width="26%" height="30%" rx="4" fill="#e2ebd8" opacity="0.6"/>
                            <rect x="52%" y="62%" width="26%" height="30%" rx="4" fill="#ddeace" opacity="0.6"/>
                        </svg>

                        <!-- Static shuttle markers (visual only, positioned illustratively) -->
                        <template v-for="(s, i) in filtered" :key="s.id">
                            <div
                                class="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center"
                                :style="{ left: (18 + i * 22) % 80 + 10 + '%', top: (25 + i * 18) % 70 + 10 + '%' }"
                                @click="selectShuttle(s)"
                            >
                                <div
                                    class="flex h-8 w-8 items-center justify-center rounded-full shadow-md ring-2 ring-white transition-transform hover:scale-110"
                                    :class="s.status === 'active' ? 'bg-green-600' : s.status === 'idle' ? 'bg-orange-400' : 'bg-gray-400'"
                                >
                                    <Bus class="h-4 w-4 text-white" />
                                </div>
                                <span class="mt-0.5 rounded bg-white px-1 text-[10px] font-semibold text-gray-700 shadow">{{ s.code }}</span>

                                <!-- Popup on selection -->
                                <div
                                    v-if="selected?.id === s.id"
                                    class="absolute bottom-full mb-2 w-44 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
                                >
                                    <p class="text-xs font-bold text-gray-800">{{ s.code }}</p>
                                    <p class="text-xs text-gray-500">Driver: {{ s.driver }}</p>
                                    <p class="text-xs text-gray-500">Route: {{ s.route }}</p>
                                    <p class="text-xs text-gray-500">Speed: {{ s.speed }} km/h</p>
                                    <p class="text-xs text-gray-500">Last seen: {{ s.last_seen }}</p>
                                    <span
                                        class="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                                        :class="statusBadge(s.status)"
                                    >{{ s.status }}</span>
                                </div>
                            </div>
                        </template>

                        <!-- Waiting passenger pins (one per pending request, illustrative) -->
                        <template v-for="(r, i) in pendingRequests.slice(0, 4)" :key="r.id">
                            <div
                                class="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                                :style="{ left: (30 + i * 20) % 75 + 12 + '%', top: (45 + i * 15) % 65 + 15 + '%' }"
                            >
                                <MapPin class="h-5 w-5 text-red-500 drop-shadow" />
                            </div>
                        </template>

                        <!-- No data overlay -->
                        <div
                            v-if="filtered.length === 0"
                            class="absolute inset-0 flex items-center justify-center"
                        >
                            <div class="rounded-xl bg-white/80 px-6 py-4 text-center shadow">
                                <Map class="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                <p class="text-sm font-medium text-gray-500">No shuttles match the filter</p>
                            </div>
                        </div>
                    </div>

                    <!-- Legend bar -->
                    <div class="flex items-center gap-5 border-t border-gray-100 bg-white px-4 py-2.5 text-xs text-gray-500">
                        <span class="flex items-center gap-1.5">
                            <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-600"><Bus class="h-2.5 w-2.5 text-white"/></span>
                            Active Shuttle
                        </span>
                        <span class="flex items-center gap-1.5">
                            <MapPin class="h-4 w-4 text-red-500" /> Waiting Passenger
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span> North
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span> South
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="h-2.5 w-2.5 rounded-full bg-orange-500"></span> Cebu City
                        </span>
                    </div>

                    <!-- Click hint -->
                    <div class="flex items-center gap-2 border-t border-blue-100 bg-blue-50 px-4 py-2 text-xs text-blue-600">
                        <Map class="h-3.5 w-3.5" />
                        Click any shuttle or pin on the map to view details in a popup
                    </div>
                </div>

                <!-- Right sidebar -->
                <div class="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto">

                    <!-- Active Shuttles panel -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Active Shuttles ({{ activeCount }})
                        </h3>
                        <div class="space-y-3">
                            <div
                                v-for="s in filtered"
                                :key="s.id"
                                class="cursor-pointer rounded-xl border border-gray-100 p-3 transition hover:border-gray-300"
                                :class="selected?.id === s.id ? 'border-green-300 bg-green-50' : ''"
                                @click="selectShuttle(s)"
                            >
                                <div class="mb-1 flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <span :class="['h-2.5 w-2.5 rounded-full', statusDot(s.status)]"></span>
                                        <span class="text-sm font-semibold text-gray-800">{{ s.code }}</span>
                                    </div>
                                    <span
                                        class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                        :class="routeBadge(s.route)"
                                    >{{ s.route }}</span>
                                </div>
                                <p class="text-xs text-gray-500">{{ s.driver }}</p>
                                <p class="text-xs text-gray-400">{{ s.status.charAt(0).toUpperCase() + s.status.slice(1) }} &middot; {{ s.last_seen }}</p>
                                <p class="text-xs text-gray-400">Speed: {{ s.speed }} km/h</p>
                                <button class="mt-2 w-full rounded-lg border border-gray-200 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                    View Details
                                </button>
                            </div>

                            <div v-if="filtered.length === 0" class="py-4 text-center text-xs text-gray-400">
                                No shuttles found
                            </div>
                        </div>
                    </div>

                    <!-- Pending Requests panel -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Pending Requests ({{ pendingRequests.length }})
                        </h3>
                        <div class="space-y-3">
                            <div v-for="r in pendingRequests.slice(0, 5)" :key="r.id">
                                <p class="text-sm font-semibold text-gray-800">#{{ r.id }} &mdash; {{ r.passenger }}</p>
                                <p class="text-xs text-gray-500">{{ r.route }} &middot; {{ r.time }}</p>
                                <p class="flex items-center gap-1 text-xs text-gray-400">
                                    <MapPin class="h-3 w-3" /> {{ r.stop }}
                                </p>
                            </div>

                            <div v-if="pendingRequests.length === 0" class="py-2 text-center text-xs text-gray-400">
                                No pending requests
                            </div>
                        </div>

                        <a href="#" class="mt-3 flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                            View All Requests <ArrowRight class="h-3 w-3" />
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </AppLayout>
</template>
