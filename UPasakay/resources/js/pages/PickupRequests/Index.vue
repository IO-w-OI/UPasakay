<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import * as L from 'leaflet';
import { Search, Download, ChevronRight, MapPin, Eye, Check, X, Map } from 'lucide-vue-next';
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
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
            created_at: string | null; completed_at: string | null;
            latitude: number | null; longitude: number | null;
            rating: number | null; comment: string | null;
        }>;
        current_page: number; last_page: number; total: number; per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    routes: string[];
    filters: { search?: string; route?: string; status?: string; date?: string };
    stats: {
        total: number; pending: number; accepted: number;
        in_progress: number; completed: number; cancelled: number;
    };
}>();

// ── Filters ────────────────────────────────────────────────────────────────
const search       = ref(props.filters.search ?? '');
const routeFilter  = ref(props.filters.route  ?? 'All');
const statusFilter = ref(props.filters.status ?? 'All');
const dateFilter   = ref(props.filters.date   ?? 'today');
const liveUpdatesActive = ref(true);
const lastUpdated = ref(new Date());
let refreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    refreshTimer = setInterval(() => {
        if (!liveUpdatesActive.value) return;

        router.reload({
            only: ['requests', 'stats'],
            preserveScroll: true,
            onFinish: () => {
                lastUpdated.value = new Date();
            },
        } as any);
    }, 25000);
});

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

    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
});

// ── Locate: expand row and scroll to the map ──────────────────────────────
const locateRequest = (id: number) => {
    if (expanded.value !== id) toggleExpand(id);
    nextTick(() => {
        document.getElementById(`req-map-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ── Helpers ────────────────────────────────────────────────────────────────
const statusColor  = (s: string) =>
    ({ pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300', accepted: 'bg-blue-500/15 text-blue-700 dark:text-blue-300', completed: 'bg-green-500/15 text-green-600 dark:text-green-400', cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400' }[s] ?? 'bg-muted text-muted-foreground');

const statusIcon = (s: string) =>
    ({ pending: Map, accepted: Check, completed: Check, cancelled: X }[s] ?? Map);

const routeBadge = (r: string) =>
    ({ South: 'bg-green-500/15 text-green-600 dark:text-green-400', North: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', 'Cebu City': 'bg-orange-500/15 text-orange-600 dark:text-orange-400' }[r] ?? 'bg-muted text-muted-foreground');

// "Today" only while the date filter is on Today; otherwise it reflects the
// full filtered scope, so the label shouldn't lie.
const totalLabel = computed(() => (dateFilter.value === 'today' ? 'Total Today' : 'Total'));

const statCards = computed(() => [
    { label: totalLabel.value, key: 'total',       color: 'text-foreground' },
    { label: 'Pending',        key: 'pending',     color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Accepted',       key: 'accepted',    color: 'text-blue-600 dark:text-blue-400' },
    { label: 'In Progress',    key: 'in_progress', color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Completed',      key: 'completed',   color: 'text-green-600 dark:text-green-400' },
    { label: 'Cancelled',      key: 'cancelled',   color: 'text-red-600 dark:text-red-400' },
] as const);
</script>

<template>
    <Head title="Pickup Requests" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <h1 class="text-2xl font-bold text-foreground">Pickup Requests</h1>

            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span class="relative flex h-2.5 w-2.5">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                Live updates active • {{ lastUpdated.toLocaleTimeString() }}
            </div>

            <!-- Stat cards -->
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <div v-for="card in statCards" :key="card.key"
                    class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20 text-center">
                    <p class="text-3xl font-bold" :class="card.color">{{ stats[card.key] }}</p>
                    <p class="mt-1 text-sm text-muted-foreground">{{ card.label }}</p>
                </div>
            </div>

            <!-- Filter bar -->
            <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="flex flex-1 items-center gap-2 rounded-lg border border-border/70 px-3 py-2 min-w-48">
                    <Search class="h-4 w-4 text-muted-foreground shrink-0" />
                    <input v-model="search" @input="apply" placeholder="Search passenger…"
                        class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
                <select v-model="routeFilter" @change="apply"
                    class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="All">Route: All</option>
                    <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                </select>
                <select v-model="statusFilter" @change="apply"
                    class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="All">Status: All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                    <select v-model="dateFilter" @change="apply"
                    class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="today">Today</option>
                    <option value="">All Time</option>
                </select>
                <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
                    <Download class="h-4 w-4" /> CSV
                </button>
            </div>

            <!-- Table -->
            <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                <th class="w-6 px-4 py-3"></th>
                                <th class="px-4 py-3">Req ID</th>
                                <th class="px-4 py-3">Passenger</th>
                                <th class="px-4 py-3">Waiting Location</th>
                                <th class="px-4 py-3">Route</th>
                                <th class="px-4 py-3">Driver</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Created</th>
                                <th class="px-4 py-3">Completed</th>
                                <th class="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="r in requests.data" :key="r.id">
                                <tr class="border-b border-border/30 hover:bg-accent cursor-pointer"
                                    :class="[
                                        r.status === 'pending' ? 'bg-amber-500/5 hover:bg-amber-500/10' : '',
                                        expanded === r.id ? 'bg-accent' : '',
                                    ]"
                                    @click="toggleExpand(r.id)">
                                    <td class="px-4 py-3 text-muted-foreground">
                                        <ChevronRight class="h-4 w-4 transition"
                                            :class="expanded === r.id ? 'rotate-90' : ''" />
                                    </td>
                                    <td class="px-4 py-3 font-semibold text-foreground">#{{ r.id }}</td>
                                    <td class="px-4 py-3 text-foreground">{{ r.passenger }}</td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ r.location }}</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(r.route)">
                                            {{ r.route }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ r.driver }}</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusColor(r.status)">
                                            <component :is="statusIcon(r.status)" class="inline-block h-3 w-3 mr-1" /> {{ r.status }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{{ r.created_at ?? '—' }}</td>
                                    <td class="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{{ r.completed_at ?? '—' }}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-1" @click.stop>
                                            <button class="rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
                                                @click="toggleExpand(r.id)">
                                                <Eye class="inline h-3 w-3 mr-0.5" /> View
                                            </button>
                                            <button
                                                class="rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                                                :class="r.latitude && r.longitude
                                                    ? 'border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10'
                                                    : 'border-border/70 text-muted-foreground/50 cursor-not-allowed'"
                                                :disabled="!r.latitude || !r.longitude"
                                                @click="r.latitude && r.longitude && locateRequest(r.id)"
                                            >
                                                <MapPin class="inline h-3 w-3 mr-0.5" /> Locate
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Expanded row -->
                                <tr v-if="expanded === r.id">
                                    <td colspan="10" class="border-b border-border/50 bg-muted/50 px-6 py-4">
                                        <div class="rounded-xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                                            <div class="mb-3 flex items-center justify-between">
                                                <h3 class="font-semibold text-foreground">REQUEST #{{ r.id }}</h3>
                                                <span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize" :class="statusColor(r.status)">
                                                    <component :is="statusIcon(r.status)" class="h-3 w-3" />
                                                    {{ r.status }}
                                                </span>
                                            </div>
                                            <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                <div><span class="text-muted-foreground">Passenger: </span><span class="text-foreground">{{ r.passenger }}</span></div>
                                                <div><span class="text-muted-foreground">Route: </span><span class="text-foreground">{{ r.route }}</span></div>
                                                <div><span class="text-muted-foreground">Waiting at: </span><span class="text-foreground">{{ r.location }}</span></div>
                                                <div><span class="text-muted-foreground">Driver: </span><span class="text-foreground">{{ r.driver }}</span></div>
                                                <div><span class="text-muted-foreground">Requested: </span><span class="text-foreground">{{ r.time }}</span></div>
                                                <div><span class="text-muted-foreground">ETA: </span><span class="text-foreground">{{ r.eta }}</span></div>
                                            </div>
                                            <div v-if="r.latitude && r.longitude"
                                                :id="`req-map-${r.id}`"
                                                class="mt-4 h-28 w-full rounded-xl border border-border/70 z-0">
                                            </div>
                                            <div v-else class="mt-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/50 text-sm text-muted-foreground">
                                                <Map class="inline-block h-5 w-5 mr-2" /> No GPS coordinates available
                                            </div>
                                            <div class="mt-4 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                                                <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Passenger Rating</p>
                                                <div v-if="r.rating" class="flex items-center gap-2">
                                                    <span class="flex gap-0.5">
                                                        <span v-for="i in 5" :key="i"
                                                            class="text-base"
                                                            :class="i <= r.rating ? 'text-yellow-400' : 'text-muted-foreground/30'">
                                                            ★
                                                        </span>
                                                    </span>
                                                    <span class="text-sm font-semibold text-foreground">{{ r.rating }}/5</span>
                                                </div>
                                                <p v-if="r.comment" class="mt-1 text-sm text-foreground italic">"{{ r.comment }}"</p>
                                                <p v-if="!r.rating" class="text-sm text-muted-foreground">No rating yet.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>

                            <tr v-if="requests.data.length === 0">
                                <td colspan="10" class="py-14 text-center text-sm text-muted-foreground">
                                    <div class="mx-auto max-w-sm rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6">
                                        <p class="text-base font-medium text-foreground">All caught up!</p>
                                        <p class="mt-2 text-sm text-muted-foreground">No pickup requests match your current filters.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between border-t border-border/50 px-4 py-3 text-sm text-muted-foreground">
                    <span>{{ requests.total }} total requests</span>
                    <div class="flex items-center gap-1">
                        <template v-for="link in requests.links" :key="link.label">
                            <Link v-if="link.url" :href="link.url"
                                class="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                :class="link.active ? 'bg-[#8B0000] text-white' : 'border border-border/70 text-muted-foreground hover:bg-accent'">
                                <span v-html="link.label" />
                            </Link>
                            <span v-else class="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/50">
                                <span v-html="link.label" />
                            </span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>

</template>
