<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    Bus, Users, ClipboardList, Star, Eye,
    Map, BarChart2, CheckCircle2,
    MapPin, CheckCheck, Clock, Bell, UserCircle2, XCircle, Pin,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { useAppearance } from '@/composables/useAppearance';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dashboardRoutes, type Landmark, type RouteConfig } from '@/data/routeData';

// Props from DashboardController
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
    notifications: Array<{ icon: string; text: string; time: string }>;
}>();

// Breadcrumbs 
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

const { resolvedAppearance } = useAppearance();

// Live datetime 
const now = ref(new Date());
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
    timer = setInterval(() => { now.value = new Date(); }, 60_000);
    nextTick(() => initMiniMap());
});
onUnmounted(() => {
    clearInterval(timer);
    miniMapRoutePolylines.forEach(pl => pl.remove());
    miniMapRoutePolylines.length = 0;
    miniMapStopMarkers.forEach(cm => cm.remove());
    miniMapStopMarkers.length = 0;
    miniMap?.remove();
    miniMap = null;
});

const currentDatetime = computed(() => {
    const d = now.value;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        + ' '
        + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
});

// Donut chart (SVG) 
const RADIUS = 60;
const CIRC   = 2 * Math.PI * RADIUS; // â‰ˆ 377

const successDash = computed(() => (props.successPct / 100) * CIRC);
const failedDash  = computed(() => (props.failedPct  / 100) * CIRC);
// Start failed arc after the success arc
const failedOffset = computed(() => CIRC - successDash.value);

// Helpers
const statusColor = (status: string) =>
    ({
        active: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        idle: 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
        offline: 'bg-muted text-muted-foreground',
    }[status] ?? 'bg-muted text-muted-foreground');

const routeColor = (route: string) =>
    ({
    South: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', 
    North: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300', 
    'Cebu City': 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    }[route] ?? 'bg-muted text-muted-foreground');

const activityIconMap: Record<string, unknown> = {
    bus:   Bus,
    check: CheckCheck,
    clock: Clock,
    bell:  Bell,
    user:  UserCircle2,
    x:     XCircle,
};
const activityIconComponent = (icon: string) => activityIconMap[icon] ?? Pin;

// Leaflet mini-map 
const miniMapRef = ref<HTMLDivElement | null>(null);
let miniMap: L.Map | null = null;
let miniMapTileLayer: L.TileLayer | null = null;

const mapShuttles = [
    { code: 'SH-001', lat: 10.2994, lng: 123.8924, route: 'South' },   // Capitol Site, heading to Tabunok
    { code: 'SH-002', lat: 10.3450, lng: 123.9130, route: 'North' },   // Talamban Jct, heading to Consolacion
    { code: 'SH-003', lat: 10.3270, lng: 123.8958, route: 'Cebu City' }, // JY Square, heading to Talamban
];
const mapPins = [
    { lat: 10.3100, lng: 123.8907 },  // Fuente OsmeÃ±a (passenger waiting, South)
    { lat: 10.3275, lng: 123.9050 },  // Banilad IT Park (passenger waiting, North)
];

// Route data (imported from @/data/routeData) 
const routeStops: RouteConfig = dashboardRoutes;

const miniMapRoutePolylines: L.Polyline[] = [];
const miniMapStopMarkers: L.CircleMarker[] = [];

// Route each consecutive pair of stops so the path is forced through every waypoint
async function fetchSegmentedRoute(stops: [number, number][]): Promise<[number, number][]> {
    if (stops.length < 2) return stops;
    const fullPath: [number, number][] = [];
    for (let i = 0; i < stops.length - 1; i++) {
        const from = stops[i];
        const to = stops[i + 1];
        try {
            const coords = `${from[1]},${from[0]};${to[1]},${to[0]}`;
            const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.length) {
                const seg = data.routes[0].geometry.coordinates.map(
                    ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
                );
                // Skip first point of subsequent segments to avoid duplicates
                fullPath.push(...(i === 0 ? seg : seg.slice(1)));
            } else {
                if (i === 0) fullPath.push(from);
                fullPath.push(to);
            }
        } catch {
            if (i === 0) fullPath.push(from);
            fullPath.push(to);
        }
    }
    return fullPath;
}

async function drawMiniMapRoutes(targetMap: L.Map) {
    for (const key of Object.keys(routeStops)) {
        const route = routeStops[key];
        try {
            const path = route.path ?? await fetchSegmentedRoute(route.stops);
            const pl = L.polyline(path, { color: route.color, weight: 4,  opacity: 0.65, smoothFactor: 1.5 }).addTo(targetMap);
            miniMapRoutePolylines.push(pl);
        } catch {
            const pl = L.polyline(route.stops, { color: route.color, weight: 3, opacity: 0.65 }).addTo(targetMap);
            miniMapRoutePolylines.push(pl);
        }
        route.landmarks.forEach((landmark) => {
            const [lat, lng] = landmark.coord;
            const cm = L.circleMarker([lat, lng], { radius: 3, color: route.color, fillColor: route.color, fillOpacity: 1, weight: 1 })
                .bindTooltip(landmark.name, { permanent: false, direction: 'top', offset: [0, -5] })
                .addTo(targetMap);
            miniMapStopMarkers.push(cm);
        });
    }
}

const shuttleIcon = L.divIcon({
    className: '',
    html: '<div style="background:#16a34a;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const stopIcon = L.divIcon({
    className: '',
    html: '<div style="color:#ef4444;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3));"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white" stroke="white"/></svg></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
});

const miniMapTileUrl = computed(() =>
    resolvedAppearance.value === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
);

const setMiniMapTiles = () => {
    if (!miniMap) return;

    miniMapTileLayer?.remove();

    miniMapTileLayer = L.tileLayer(miniMapTileUrl.value, {
        maxZoom: 19,
        subdomains: resolvedAppearance.value === 'dark' ? 'abcd' : 'abc',
    });

    miniMapTileLayer.addTo(miniMap);
};

const initMiniMap = () => {
    if (!miniMapRef.value || miniMap) return;
    miniMap = L.map(miniMapRef.value, { zoomControl: false, attributionControl: false }).setView([10.3157, 123.8900], 13);
    setMiniMapTiles();
    mapShuttles.forEach(s => L.marker([s.lat, s.lng], { icon: shuttleIcon }).bindTooltip(s.code).addTo(miniMap!));
    mapPins.forEach(p => L.marker([p.lat, p.lng], { icon: stopIcon }).addTo(miniMap!));
    setTimeout(() => miniMap?.invalidateSize(), 200);

    // Draw OSRM road-following routes
    drawMiniMapRoutes(miniMap!);
};

watch(resolvedAppearance, () => {
    setMiniMapTiles();
});
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <!-- Stats cards-->
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <!-- Active Shuttles -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-500 dark:bg-indigo-500/18 dark:text-indigo-300">
                        <Bus class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.activeShuttles }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Active Shuttles</div>
                    <div class="mt-2 text-xs font-medium text-emerald-500 dark:text-emerald-300">â†‘ 1 vs yesterday</div>
                </div>

                <!-- Drivers Online -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/12 text-purple-500 dark:bg-purple-500/18 dark:text-purple-300">
                        <Users class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.driversOnline }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Drivers Online</div>
                    <div class="mt-2 text-xs font-medium text-orange-500 dark:text-orange-300">â†“ 2 vs yesterday</div>
                </div>

                <!-- Pending Requests -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/12 text-orange-500 dark:bg-orange-500/18 dark:text-orange-300">
                        <ClipboardList class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.pendingRequests }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Pending Requests</div>
                    <div class="mt-2 text-xs font-medium text-orange-500 dark:text-orange-300">â†‘ 4 vs yesterday</div>
                </div>

                <!-- Avg Feedback -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/12 text-yellow-500 dark:bg-yellow-500/18 dark:text-yellow-300">
                        <Star class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.avgFeedback }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Avg Feedback Today</div>
                    <div class="mt-2 text-xs font-medium text-emerald-500 dark:text-emerald-300">â†‘ 0.3 vs yesterday</div>
                </div>
            </div>

            <!-- Live Map + Recent Activity-->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">

                <!-- Live Map Mini -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20 lg:col-span-7">
                    <div class="mb-3 flex items-center justify-between">
                        <h2 class="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Map class="h-4 w-4 text-muted-foreground" /> Live Map (Mini)
                        </h2>
                        <Link href="/live-map" class="text-xs font-medium text-primary hover:text-primary/80 hover:underline">View Full Map &rsaquo;</Link>
                    </div>

                    <!-- Leaflet mini-map -->
                    <div ref="miniMapRef" class="z-0 h-44 w-full overflow-hidden rounded-xl border border-border/70 bg-muted/30"></div>
                </div>

                <!-- Notifications -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20 lg:col-span-5">
                    <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Bell class="h-4 w-4 text-muted-foreground" /> Notifications
                    </h2>
                    <ul class="space-y-3">
                        <li
                            v-for="(item, i) in notifications"
                            :key="i"
                            class="flex items-start gap-3"
                        >
                            <component :is="activityIconComponent(item.icon)" class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-xs text-foreground">{{ item.text }}</p>
                                <p class="text-[11px] text-muted-foreground">{{ item.time }}</p>
                            </div>
                        </li>
                    </ul>
                    <Link href="/notifications" class="mt-3 inline-block text-xs font-medium text-primary hover:text-primary/80 hover:underline">View All Notifications &rsaquo;</Link>
                </div>
            </div>

            <!-- Shuttle Status Overview -->
            <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Bus class="h-4 w-4 text-muted-foreground" /> Shuttle Status Overview
                    </h2>
                    <Link href="/feedback?tab=reports" class="text-xs font-medium text-primary hover:text-primary/80 hover:underline">View All &rsaquo;</Link>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-border/70 text-left text-xs font-medium text-muted-foreground">
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
                                class="border-b border-border/50 last:border-0"
                            >
                                <td class="py-3 pr-4 font-semibold text-foreground">{{ s.shuttle_code }}</td>
                                <td class="py-3 pr-4 text-muted-foreground">{{ s.driver }}</td>
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
                                <td class="py-3 pr-4 text-xs text-muted-foreground">{{ s.last_seen }}</td>
                                <td class="py-3">
                                    <button class="text-muted-foreground/70 hover:text-foreground">
                                        <Eye class="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Charts row -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">

                <!-- Pickups per Route (horizontal bar chart) -->
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BarChart2 class="h-4 w-4 text-muted-foreground" /> Pickups per Route
                    </h2>
                    <div class="space-y-4">
                        <div v-for="r in pickupsPerRoute" :key="r.name">
                            <div class="mb-1 flex items-center justify-between text-xs">
                                <span class="text-muted-foreground">{{ r.name }}</span>
                            </div>
                            <div class="h-6 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    class="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                    :style="{ width: ((r.count / maxPickups) * 100).toFixed(1) + '%' }"
                                ></div>
                            </div>
                        </div>
                        <!-- X-axis labels -->
                        <div class="flex justify-between text-[10px] text-muted-foreground">
                            <span>0</span>
                            <span>{{ Math.round(maxPickups * 0.25) }}</span>
                            <span>{{ Math.round(maxPickups * 0.5) }}</span>
                            <span>{{ Math.round(maxPickups * 0.75) }}</span>
                            <span>{{ maxPickups }}</span>
                        </div>
                    </div>
                </div>

                <!-- Boarding Success Rate (donut) -->
                <div class="flex flex-col items-center rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <h2 class="mb-4 flex w-full items-center gap-2 text-left text-sm font-semibold text-foreground">
                        <CheckCircle2 class="h-4 w-4 text-muted-foreground" /> Boarding Success Rate
                    </h2>
                    <svg width="160" height="160" viewBox="0 0 160 160" class="my-2">
                        <!-- Background ring -->
                        <circle cx="80" cy="80" r="60" fill="none" stroke="var(--muted)" stroke-width="20"/>

                        <!-- Success arc (green) -->
                        <circle
                            cx="80" cy="80" r="60"
                            fill="none"
                            stroke="#22c55e"
                            stroke-width="20"
                            :stroke-dasharray="`${successDash} ${CIRC}`"
                            :stroke-dashoffset="0"
                            stroke-linecap="round"
                            transform="rotate(-90 80 80)"
                        />                        
                        <!-- Failed arc (red) -->
                        <circle
                            cx="80" cy="80" r="60"
                            fill="none"
                            stroke="#ef4444"
                            stroke-width="20"
                            :stroke-dasharray="`${failedDash} ${CIRC}`"
                            :stroke-dashoffset="`-${successDash}`"
                            stroke-linecap="round"
                            transform="rotate(-90 80 80)"
                        />


                        <!-- Center label -->
                        <text x="80" y="76" text-anchor="middle" class="font-bold" font-size="22" fill="var(--foreground)" font-weight="700">{{ successPct }}%</text>
                        <text x="80" y="96" text-anchor="middle" font-size="11" fill="var(--muted-foreground)">Success</text>
                    </svg>

                    <div class="mt-2 flex gap-6">
                        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span class="inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            Success - {{ successPct }}%
                        </div>
                        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span class="inline-block h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            Failed - {{ failedPct }}%
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </AppLayout>
</template>


