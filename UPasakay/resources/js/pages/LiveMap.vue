<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Map as MapIcon, Bus, MapPin, RefreshCw, ClipboardList, ArrowRight } from 'lucide-vue-next';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { useAppearance } from '@/composables/useAppearance';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { liveMapRoutes, type Landmark, type RouteConfig } from '@/data/routeData';

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

// Filter / search
const routeFilter = ref('All');
const searchQuery  = ref('');
const autoRefresh  = ref(true);

const routes = computed(() => {
    const unique = [...new Set(props.shuttles.map(s => s.route).filter(r => r !== '”'))];
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

//  Selected shuttle (for detail popup) 
const selected = ref<typeof props.shuttles[0] | null>(null);
const selectShuttle = (s: typeof props.shuttles[0]) => {
    selected.value = selected.value?.id === s.id ? null : s;
};

const { resolvedAppearance } = useAppearance();

//  Helpers 
const statusDot = (status: string) =>
    ({ active: 'bg-green-500', idle: 'bg-orange-400', offline: 'bg-gray-400' }[status] ?? 'bg-gray-400');

const statusBadge = (status: string) =>
    ({ active: 'bg-green-500/15 text-green-600 dark:text-green-400', idle: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', offline: 'bg-muted text-muted-foreground' }[status] ?? 'bg-muted text-muted-foreground');

const routeBadge = (route: string) =>
    ({ South: 'bg-green-500/15 text-green-600 dark:text-green-400', North: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', 'Cebu City': 'bg-orange-500/15 text-orange-600 dark:text-orange-400' }[route] ?? 'bg-muted text-muted-foreground');

const routeDot = (route: string) =>
    ({ South: 'bg-green-500', North: 'bg-blue-500', 'Cebu City': 'bg-orange-500' }[route] ?? 'bg-gray-400');

const activeCount = computed(() => props.shuttles.filter(s => s.status === 'active').length);

const filteredRequests = computed(() => {
    const list = routeFilter.value === 'All'
        ? props.pendingRequests
        : props.pendingRequests.filter(r => r.route === routeFilter.value);
    return list.slice(0, 5);
});

//  Leaflet map 
const mapRef = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
const shuttleMarkers = new Map<number, L.Marker>();
const otherMarkers: L.Marker[] = [];

const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const darkTileUrl  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const statusColors: Record<string, string> = { active: '#16a34a', idle: '#fb923c', offline: '#9ca3af' };

const makeShuttleIcon = (status: string) => L.divIcon({
    className: '',
    html: `<div style="background:${statusColors[status] ?? '#9ca3af'};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const passengerIcon = L.divIcon({
    className: '',
    html: '<div style="color:#ef4444;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3));"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white" stroke="white"/></svg></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
});

const syncMarkers = () => {
    if (!map) return;
    // Remove all existing markers
    shuttleMarkers.forEach(m => m.remove());
    shuttleMarkers.clear();
    otherMarkers.forEach(m => m.remove());
    otherMarkers.length = 0;

    filtered.value.forEach((s, i) => {
        const lat = s.latitude ?? 10.3157 + (i * 0.004);
        const lng = s.longitude ?? 123.8854 + (i * 0.005);
        const marker = L.marker([lat, lng], { icon: makeShuttleIcon(s.status) })
            .bindPopup(`<div style="font-size:13px;"><b>${s.code}</b><br>Driver: ${s.driver}<br>Route: ${s.route}<br>Speed: ${s.speed} km/h<br>Status: ${s.status}</div>`)
            .addTo(map!);
        marker.on('click', () => selectShuttle(s));
        shuttleMarkers.set(s.id, marker);
    });

    const visibleRequests = routeFilter.value === 'All'
        ? props.pendingRequests.slice(0, 8)
        : props.pendingRequests.filter(r => r.route === routeFilter.value).slice(0, 8);

    visibleRequests.forEach((r, i) => {
        const lat = 10.3140 + (i * 0.003);
        const lng = 123.8870 + (i * 0.004);
        const m = L.marker([lat, lng], { icon: passengerIcon })
            .bindPopup(`<div style="font-size:13px;"><b>#${r.id}</b> ${r.passenger}<br>${r.route} - ${r.stop}</div>`)
            .addTo(map!);
        otherMarkers.push(m);
    });
};

watch(filtered, () => syncMarkers());

// Route data (imported from @/data/routeData)
const routeStops: RouteConfig = liveMapRoutes;


const routePolylines = new Map<string, L.Polyline>();
const routeStopMarkers = new Map<string, L.CircleMarker[]>();

const filterKeyToRouteKey: Record<string, string> = {
    'South': 'south',
    'North': 'north',
    'Cebu City': 'cebuCity',
};

function syncRouteVisibility() {
    if (!map) return;
    const activeKey = filterKeyToRouteKey[routeFilter.value];
    for (const [key, pl] of routePolylines) {
        const visible = !activeKey || key === activeKey;
        if (visible && !map.hasLayer(pl)) pl.addTo(map);
        if (!visible && map.hasLayer(pl)) map.removeLayer(pl);
    }
    for (const [key, markers] of routeStopMarkers) {
        const visible = !activeKey || key === activeKey;
        markers.forEach(cm => {
            if (visible && !map!.hasLayer(cm)) cm.addTo(map!);
            if (!visible && map!.hasLayer(cm)) map!.removeLayer(cm);
        });
    }
}

watch(routeFilter, () => {
    syncRouteVisibility();
    syncMarkers();
});

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

async function drawRoutes(targetMap: L.Map) {
    for (const key of Object.keys(routeStops)) {
        const route = routeStops[key];
        try {
            const path = route.path ?? await fetchSegmentedRoute(route.stops);
            const pl = L.polyline(path, { color: route.color, weight: 5, opacity: 0.65, smoothFactor: 1.5 }).addTo(targetMap);
            routePolylines.set(key, pl);
        } catch {
            const pl = L.polyline(route.stops, { color: route.color, weight: 4, opacity: 0.65 }).addTo(targetMap);
            routePolylines.set(key, pl);
        }
        const markers: L.CircleMarker[] = [];
        route.landmarks.forEach((landmark) => {
            const [lat, lng] = landmark.coord;
            const cm = L.circleMarker([lat, lng], { radius: 5, color: route.color, fillColor: route.color, fillOpacity: 1, weight: 2 })
                .bindTooltip(landmark.name, { permanent: false, direction: 'top', offset: [0, -5] })
                .addTo(targetMap);
            markers.push(cm);
        });
        routeStopMarkers.set(key, markers);
    }
    syncRouteVisibility();
}

onMounted(() => {
    nextTick(() => {
        if (!mapRef.value) return;
        map = L.map(mapRef.value).setView([10.3157, 123.8900], 14);
        const isDark = document.documentElement.classList.contains('dark');
        tileLayer = L.tileLayer(isDark ? darkTileUrl : lightTileUrl, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
            subdomains: isDark ? 'abcd' : 'abc',
        }).addTo(map);
        syncMarkers();

        // Leaflet needs a tick for the flex container to settle its dimensions
        setTimeout(() => map?.invalidateSize(), 200);

        // Draw OSRM road-following routes
        drawRoutes(map!);
    });
});

onUnmounted(() => {
    shuttleMarkers.forEach(m => m.remove());
    shuttleMarkers.clear();
    otherMarkers.forEach(m => m.remove());
    otherMarkers.length = 0;
    routePolylines.forEach(pl => pl.remove());
    routePolylines.clear();
    routeStopMarkers.forEach(markers => markers.forEach(cm => cm.remove()));
    routeStopMarkers.clear();
    tileLayer?.remove();
    tileLayer = null;
    map?.remove();
    map = null;
});

watch(resolvedAppearance, () => {
    if (!map || !tileLayer) return;
    const isDark = resolvedAppearance.value === 'dark';
    map.removeLayer(tileLayer);
    tileLayer = L.tileLayer(isDark ? darkTileUrl : lightTileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: isDark ? 'abcd' : 'abc',
    }).addTo(map);
});
</script>

<template>
    <Head title="Live Map" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden p-6 pb-0">

            <!--  Filters row  -->
            <div class="mb-3 flex items-center gap-2">
                <select
                    v-model="routeFilter"
                    class="rounded-lg border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground shadow-sm shadow-black/5 dark:shadow-black/20 focus:outline-none"
                >
                    <option v-for="r in routes" :key="r">{{ r }}</option>
                </select>
                <div class="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-1.5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search shuttle or driver"
                        class="w-44 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <MapIcon class="h-4 w-4 text-muted-foreground" />
                </div>
                <button
                    class="ml-auto flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700"
                    @click="autoRefresh = !autoRefresh"
                >
                    <RefreshCw class="h-4 w-4" :class="autoRefresh ? 'animate-spin animation-duration-[3s]' : ''" />
                    Auto-refresh
                </button>
            </div>

            <!--  Main body: map + sidebar  -->
            <div class="flex min-h-0 flex-1 gap-4 pb-6">

                <!-- Map area -->
                <div class="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">

                    <!-- Leaflet map -->
                    <div ref="mapRef" class="relative flex-1 z-0">
                        <!-- No data overlay -->
                        <div
                            v-if="filtered.length === 0"
                            class="pointer-events-none absolute inset-0 z-1000 flex items-center justify-center"
                        >
                            <div class="rounded-xl bg-card/80 px-6 py-4 text-center shadow">
                                <MapIcon class="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p class="text-sm font-medium text-muted-foreground">No shuttles match the filter</p>
                            </div>
                        </div>
                    </div>

                    <!-- Legend bar -->
                    <div class="flex items-center gap-5 border-t border-border/50 bg-card px-4 py-2.5 text-xs text-muted-foreground">
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
                    <div class="flex items-center gap-2 border-t border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs text-blue-600 dark:text-blue-400">
                        <MapIcon class="h-3.5 w-3.5" />
                        Click any shuttle or pin on the map to view details in a popup
                    </div>
                </div>

                <!-- Right sidebar -->
                <div class="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto">

                    <!-- Active Shuttles panel -->
                    <div class="rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                        <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Active Shuttles ({{ activeCount }})
                        </h3>
                        <div class="space-y-3">
                            <div
                                v-for="s in filtered"
                                :key="s.id"
                                class="cursor-pointer rounded-xl border border-border/50 p-3 transition hover:border-border"
                                :class="selected?.id === s.id ? 'border-green-500/50 bg-green-500/10' : ''"
                                @click="selectShuttle(s)"
                            >
                                <div class="mb-1 flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <span :class="['h-2.5 w-2.5 rounded-full', statusDot(s.status)]"></span>
                                        <span class="text-sm font-semibold text-foreground">{{ s.code }}</span>
                                    </div>
                                    <span
                                        class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                        :class="routeBadge(s.route)"
                                    >{{ s.route }}</span>
                                </div>
                                <p class="text-xs text-muted-foreground">{{ s.driver }}</p>
                                <p class="text-xs text-muted-foreground/70">{{ s.status.charAt(0).toUpperCase() + s.status.slice(1) }} &middot; {{ s.last_seen }}</p>
                                <p class="text-xs text-muted-foreground/70">Speed: {{ s.speed }} km/h</p>
                                <button class="mt-2 w-full rounded-lg border border-border/70 py-1 text-xs font-medium text-muted-foreground hover:bg-accent">
                                    View Details
                                </button>
                            </div>

                            <div v-if="filtered.length === 0" class="py-4 text-center text-xs text-muted-foreground">
                                No shuttles found
                            </div>
                        </div>
                    </div>

                    <!-- Pending Requests panel -->
                    <div class="rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                        <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Pending Requests ({{ filteredRequests.length }})
                        </h3>
                        <div class="space-y-3">
                            <div v-for="r in filteredRequests" :key="r.id">
                                <p class="text-sm font-semibold text-foreground">#{{ r.id }} &mdash; {{ r.passenger }}</p>
                                <p class="text-xs text-muted-foreground">{{ r.route }} &middot; {{ r.time }}</p>
                                <p class="flex items-center gap-1 text-xs text-muted-foreground/70">
                                    <MapPin class="h-3 w-3" /> {{ r.stop }}
                                </p>
                            </div>

                            <div v-if="filteredRequests.length === 0" class="py-2 text-center text-xs text-muted-foreground">
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

