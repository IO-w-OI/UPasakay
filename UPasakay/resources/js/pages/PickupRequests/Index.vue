<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { Search, Download, ChevronRight, MapPin, Eye, Check, X, Map } from 'lucide-vue-next';
import { ref, nextTick, onUnmounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',     href: dashboard().url },
    { title: 'Requests', href: '/pickup-requests' },
];

const props = defineProps<{
    requests: {
        data: Array<{
            id: number; passenger: string; location: string; route: string;
            driver: string; status: string; time: string; date: string; eta: string;
            latitude: number | null; longitude: number | null;
        }>;
        current_page: number; last_page: number; total: number; per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    routes: string[];
    filters: { search?: string; route?: string; status?: string; date?: string };
    stats: { total: number; pending: number; completed: number; cancelled: number };
}>();

// ── Filters ────────────────────────────────────────────────────────────────
const search       = ref(props.filters.search ?? '');
const routeFilter  = ref(props.filters.route  ?? 'All');
const statusFilter = ref(props.filters.status ?? 'All');
const dateFilter   = ref(props.filters.date   ?? 'today');

const apply = () => {
    router.get('/pickup-requests', {
        search:  search.value || undefined,
        route:   routeFilter.value  !== 'All' ? routeFilter.value  : undefined,
        status:  statusFilter.value !== 'All' ? statusFilter.value : undefined,
        date:    dateFilter.value || undefined,
    }, { preserveState: true, replace: true });
};

// ── Expanded row ───────────────────────────────────────────────────────────
const expanded = ref<number | null>(null);
const toggleExpand = (id: number) => {
    expanded.value = expanded.value === id ? null : id;
    if (expanded.value !== null) {
        const req = props.requests.data.find(r => r.id === expanded.value);
        if (req?.latitude && req?.longitude) {
            nextTick(() => initRequestMap(req.id, req.latitude!, req.longitude!));
        }
    }
};

// ── Leaflet request maps ─────────────────────────────────────────────────
const requestMaps = new window.Map<number, L.Map>();

const initRequestMap = (id: number, lat: number, lng: number) => {
    requestMaps.get(id)?.remove();
    const el = document.getElementById(`req-map-${id}`);
    if (!el) return;
    const m = L.map(el, { zoomControl: false, attributionControl: false }).setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
    L.marker([lat, lng]).addTo(m);
    requestMaps.set(id, m);
};

onUnmounted(() => {
    requestMaps.forEach(m => m.remove());
    requestMaps.clear();
});

// ── Helpers ────────────────────────────────────────────────────────────────
const statusColor  = (s: string) =>
    ({ pending: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }[s] ?? 'bg-gray-100 text-gray-500');

const statusIcon = (s: string) =>
    ({ pending: Map, completed: Check, cancelled: X }[s] ?? Map);

const routeBadge = (r: string) =>
    ({ South: 'bg-green-100 text-green-700', North: 'bg-blue-100 text-blue-700', 'Cebu City': 'bg-orange-100 text-orange-700' }[r] ?? 'bg-gray-100 text-gray-600');

const statCards = [
    { label: 'Total Today',  key: 'total',     color: 'text-gray-900' },
    { label: 'Pending',      key: 'pending',   color: 'text-yellow-600' },
    { label: 'Completed',    key: 'completed', color: 'text-green-600' },
    { label: 'Cancelled',    key: 'cancelled', color: 'text-red-600' },
] as const;
</script>

<template>
    <Head title="Pickup Requests" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <h1 class="text-2xl font-bold text-gray-900">Pickup Requests</h1>

            <!-- Stat cards -->
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div v-for="card in statCards" :key="card.key"
                    class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                    <p class="text-3xl font-bold" :class="card.color">{{ stats[card.key] }}</p>
                    <p class="mt-1 text-sm text-gray-400">{{ card.label }}</p>
                </div>
            </div>

            <!-- Filter bar -->
            <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 min-w-48">
                    <Search class="h-4 w-4 text-gray-400 shrink-0" />
                    <input v-model="search" @input="apply" placeholder="Search passenger…"
                        class="flex-1 text-sm outline-none placeholder:text-gray-400" />
                </div>
                <select v-model="routeFilter" @change="apply"
                    class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                    <option value="All">Route: All</option>
                    <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                </select>
                <select v-model="statusFilter" @change="apply"
                    class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                    <option value="All">Status: All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                    <select v-model="dateFilter" @change="apply"
                    class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                    <option value="today">Today</option>
                    <option value="">All Time</option>
                </select>
                <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    <Download class="h-4 w-4" /> CSV
                </button>
            </div>

            <!-- Table -->
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                <th class="w-6 px-4 py-3"></th>
                                <th class="px-4 py-3">Req ID</th>
                                <th class="px-4 py-3">Passenger</th>
                                <th class="px-4 py-3">Waiting Location</th>
                                <th class="px-4 py-3">Route</th>
                                <th class="px-4 py-3">Driver</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="r in requests.data" :key="r.id">
                                <tr class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                                    :class="expanded === r.id ? 'bg-gray-50' : ''"
                                    @click="toggleExpand(r.id)">
                                    <td class="px-4 py-3 text-gray-400">
                                        <ChevronRight class="h-4 w-4 transition"
                                            :class="expanded === r.id ? 'rotate-90' : ''" />
                                    </td>
                                    <td class="px-4 py-3 font-semibold text-gray-800">#{{ r.id }}</td>
                                    <td class="px-4 py-3 text-gray-700">{{ r.passenger }}</td>
                                    <td class="px-4 py-3 text-gray-500">{{ r.location }}</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(r.route)">
                                            {{ r.route }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-gray-600">{{ r.driver }}</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusColor(r.status)">
                                            <component :is="statusIcon(r.status)" class="inline-block h-3 w-3 mr-1" /> {{ r.status }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-1" @click.stop>
                                            <button class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                                                <Eye class="inline h-3 w-3 mr-0.5" /> View
                                            </button>
                                            <button class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                                                <MapPin class="inline h-3 w-3 mr-0.5" /> Locate
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Expanded row -->
                                <tr v-if="expanded === r.id">
                                    <td colspan="8" class="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                            <div class="mb-3 flex items-center justify-between">
                                                <h3 class="font-semibold text-gray-900">REQUEST #{{ r.id }}</h3>
                                                <span class="rounded-full px-3 py-1 text-xs font-medium capitalize" :class="statusColor(r.status)">
                                                    Status: {{ statusIcon(r.status) }} {{ r.status }}
                                                </span>
                                            </div>
                                            <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                <div><span class="text-gray-500">Passenger: </span><span class="text-gray-800">{{ r.passenger }}</span></div>
                                                <div><span class="text-gray-500">Route: </span><span class="text-gray-800">{{ r.route }}</span></div>
                                                <div><span class="text-gray-500">Waiting at: </span><span class="text-gray-800">{{ r.location }}</span></div>
                                                <div><span class="text-gray-500">Driver: </span><span class="text-gray-800">{{ r.driver }}</span></div>
                                                <div><span class="text-gray-500">Requested: </span><span class="text-gray-800">{{ r.time }}</span></div>
                                                <div><span class="text-gray-500">ETA: </span><span class="text-gray-800">{{ r.eta }}</span></div>
                                            </div>
                                            <div v-if="r.latitude && r.longitude"
                                                :id="`req-map-${r.id}`"
                                                class="mt-4 h-28 w-full rounded-xl border border-gray-200 z-0">
                                            </div>
                                            <div v-else class="mt-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                                                <Map class="inline-block h-5 w-5 mr-2" /> No GPS coordinates available
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>

                            <tr v-if="requests.data.length === 0">
                                <td colspan="8" class="py-10 text-center text-sm text-gray-400">No requests found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                    <span>{{ requests.total }} total requests</span>
                    <div class="flex items-center gap-1">
                        <template v-for="link in requests.links" :key="link.label">
                            <Link v-if="link.url" :href="link.url"
                                class="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                :class="link.active ? 'bg-[#8B0000] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'"
                                v-html="link.label" />
                            <span v-else class="rounded-lg px-2.5 py-1.5 text-xs text-gray-300" v-html="link.label" />
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
