<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import L from 'leaflet';
import {
    BarChart2,
    Bell,
    Bus,
    ClipboardList,
    Eye,
    LayoutList,
    Map,
    Star,
    UserCheck2,
    Users,
    Pin,
    Clock,
    UserCircle2,
    XCircle,
    CheckCheck,
} from 'lucide-vue-next';
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { liveMapRoutes, type RouteConfig } from '@/data/routeData';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import 'leaflet/dist/leaflet.css';

defineProps<{
    stats: {
        activeShuttles: number;
        driversOnline: number;
        pendingRequests: number;
        pendingApprovals: number;
        avgFeedback: string;
    };
    // shuttles for table + mini map (includes coordinates)
    shuttles: Array<{
        id?: number;
        shuttle_code?: string;
        code?: string;
        driver: string;
        route: string;
        status: string;
        last_seen: string;
        speed?: number;
        latitude?: number | null;
        longitude?: number | null;
    }>;
    // small set of pending requests for map pins
    pendingRequests?: Array<{
        id: number;
        passenger: string;
        route: string;
        stop: string;
        time: string;
    }>;
    pickupsPerRoute: Array<{ name: string; count: number }>;
    maxPickups: number;
    needsAttention: Array<{ icon: string; type: string; text: string; time: string; href: string }>;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

const miniMapRef = ref<HTMLDivElement | null>(null);
let miniMap: L.Map | null = null;
let miniTileLayer: L.TileLayer | null = null;
const shuttleMarkers = new Map<number, L.Marker>();
const otherMarkers: L.Marker[] = [];

const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const statusColors: Record<string, string> = { active: '#16a34a', idle: '#fb923c', offline: '#9ca3af' };

const makeShuttleIcon = (status: string) => L.divIcon({
    className: '',
    html: `<div style="background:${statusColors[status] ?? '#9ca3af'};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid #fff;"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 6v6\"/><path d=\"M15 6v6\"/><path d=\"M2 12h19.6\"/><path d=\"M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/><path d=\"M9 18h5\"/><circle cx=\"16\" cy=\"18\" r=\"2\"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const passengerIcon = L.divIcon({
    className: '',
    html: '<div style="color:#ef4444;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25));"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2" fill="white" stroke="white"/></svg></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 18],
});

const routeStops: RouteConfig = liveMapRoutes;
const routePolylines = new Map<string, L.Polyline>();
const routeStopMarkers = new Map<string, L.CircleMarker[]>();

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
                const seg = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
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
            const pl = L.polyline(path, { color: route.color, weight: 4, opacity: 0.7 }).addTo(targetMap);
            routePolylines.set(key, pl);
        } catch {
            const pl = L.polyline(route.stops, { color: route.color, weight: 3, opacity: 0.7 }).addTo(targetMap);
            routePolylines.set(key, pl);
        }
        const markers: L.CircleMarker[] = [];
        route.landmarks.forEach((landmark) => {
            const [lat, lng] = landmark.coord;
            const cm = L.circleMarker([lat, lng], { radius: 4, color: route.color, fillColor: route.color, fillOpacity: 1, weight: 1 })
                .bindTooltip(landmark.name, { permanent: false, direction: 'top', offset: [0, -5] })
                .addTo(targetMap);
            markers.push(cm);
        });
        routeStopMarkers.set(key, markers);
    }
}

const syncMarkers = () => {
    if (!miniMap) return;
    shuttleMarkers.forEach(m => m.remove());
    shuttleMarkers.clear();
    otherMarkers.forEach(m => m.remove());
    otherMarkers.length = 0;

    // shuttles prop may contain either `id` or `shuttle_code` as identifier
    (props.shuttles ?? []).forEach((s, i) => {
        const lat = s.latitude ?? 10.3157 + (i * 0.004);
        const lng = s.longitude ?? 123.8854 + (i * 0.005);
        const marker = L.marker([lat, lng], { icon: makeShuttleIcon(s.status) })
            .bindPopup(`<div style="font-size:13px;"><b>${s.code ?? s.shuttle_code}</b><br>Driver: ${s.driver}<br>Route: ${s.route}</div>`)
            .addTo(miniMap!);
        shuttleMarkers.set(s.id ?? i, marker);
    });

    (props.pendingRequests ?? []).slice(0, 6).forEach((r, i) => {
        const lat = 10.3140 + (i * 0.003);
        const lng = 123.8870 + (i * 0.004);
        const m = L.marker([lat, lng], { icon: passengerIcon })
            .bindPopup(`<div style="font-size:13px;"><b>#${r.id}</b> ${r.passenger}<br>${r.route} - ${r.stop}</div>`)
            .addTo(miniMap!);
        otherMarkers.push(m);
    });
};

onMounted(() => {
    nextTick(() => {
        if (!miniMapRef.value) return;
        miniMap = L.map(miniMapRef.value, { zoomControl: false, attributionControl: false }).setView([10.3157, 123.8900], 13);
        // Force default/light tiles regardless of dark mode
        miniTileLayer = L.tileLayer(lightTileUrl, { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(miniMap);
        syncMarkers();
        setTimeout(() => miniMap?.invalidateSize(), 200);
        // Draw routes (async)
        drawRoutes(miniMap);
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
    miniTileLayer?.remove();
    miniTileLayer = null;
    miniMap?.remove();
    miniMap = null;
});

const statusColor = (status: string) =>
    ({
        active: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        idle: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        offline: 'bg-muted text-muted-foreground',
    })[status] ?? 'bg-muted text-muted-foreground';

const routeColor = (route: string) =>
    ({
        South: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        North: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        'Cebu City': 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    })[route] ?? 'bg-muted text-muted-foreground';

const attentionIconMap: Record<string, unknown> = {
    bus: Bus,
    check: CheckCheck,
    clock: Clock,
    bell: Bell,
    user: UserCircle2,
    x: XCircle,
};

const attentionIcon = (icon: string) => attentionIconMap[icon] ?? Pin;
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">
            <div class="grid grid-cols-2 gap-4 xl:grid-cols-5">
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-500 dark:bg-indigo-500/18 dark:text-indigo-300">
                        <Bus class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.activeShuttles }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Active Shuttles</div>
                </div>

                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-500 dark:bg-violet-500/18 dark:text-violet-300">
                        <Users class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.driversOnline }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Drivers Online</div>
                </div>

                <Link href="/pickup-requests?status=pending" class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 transition hover:border-amber-400/50 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/12 text-amber-500 dark:bg-amber-500/18 dark:text-amber-300">
                        <ClipboardList class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.pendingRequests }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Pending Requests</div>
                </Link>

                <Link href="/passengers?tab=pending" class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 transition hover:border-amber-400/50 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/12 text-amber-500 dark:bg-amber-500/18 dark:text-amber-300">
                        <UserCheck2 class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.pendingApprovals }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Pending Approvals</div>
                </Link>

                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/12 text-yellow-500 dark:bg-yellow-500/18 dark:text-yellow-300">
                        <Star class="h-5 w-5" />
                    </div>
                    <div class="text-3xl font-bold text-foreground">{{ stats.avgFeedback }}</div>
                    <div class="mt-1 text-sm text-muted-foreground">Avg Feedback Today</div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20 lg:col-span-7">
                    <div class="mb-3 flex items-center justify-between">
                        <h2 class="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Map class="h-4 w-4 text-muted-foreground" /> Live Map (Mini)
                        </h2>
                        <Link href="/live-map" class="text-xs font-medium text-primary hover:text-primary/80 hover:underline">View Full Map &rsaquo;</Link>
                    </div>
                    <div ref="miniMapRef" class="z-0 h-52 w-full overflow-hidden rounded-xl border border-border/70 bg-muted/30" />
                </div>

                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20 lg:col-span-5">
                    <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <LayoutList class="h-4 w-4 text-muted-foreground" /> Needs Attention
                    </h2>
                    <ul class="space-y-3">
                        <li
                            v-for="(item, i) in needsAttention"
                            :key="`${item.type}-${i}`"
                            class="flex items-start gap-3"
                        >
                            <component :is="attentionIcon(item.icon)" class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-xs text-foreground">{{ item.text }}</p>
                                <p class="text-[11px] text-muted-foreground">{{ item.time }}</p>
                            </div>
                            <Link :href="item.href" class="text-xs font-medium text-primary hover:underline">Open</Link>
                        </li>
                        <li v-if="needsAttention.length === 0" class="rounded-xl border border-dashed border-border/70 bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
                            All clear. No urgent pickup or approval items right now.
                        </li>
                    </ul>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="mb-4 flex items-center justify-between">
                        <h2 class="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Bus class="h-4 w-4 text-muted-foreground" /> Shuttle Status Overview
                        </h2>
                        <Link href="/drivers" class="text-xs font-medium text-primary hover:text-primary/80 hover:underline">Manage &rsaquo;</Link>
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
                                    <th class="pb-2" />
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="s in shuttles" :key="s.shuttle_code" class="border-b border-border/50 last:border-0">
                                    <td class="py-3 pr-4 font-semibold text-foreground">{{ s.shuttle_code }}</td>
                                    <td class="py-3 pr-4 text-muted-foreground">{{ s.driver }}</td>
                                    <td class="py-3 pr-4">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeColor(s.route)">
                                            {{ s.route }}
                                        </span>
                                    </td>
                                    <td class="py-3 pr-4">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusColor(s.status)">
                                            {{ s.status.charAt(0).toUpperCase() + s.status.slice(1) }}
                                        </span>
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

                <div class="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BarChart2 class="h-4 w-4 text-muted-foreground" /> Pickups per Route
                    </h2>
                    <div class="space-y-4">
                        <div v-for="r in pickupsPerRoute" :key="r.name">
                            <div class="mb-1 flex items-center justify-between text-xs">
                                <span class="text-muted-foreground">{{ r.name }}</span>
                                <span class="font-semibold text-foreground">{{ r.count }}</span>
                            </div>
                            <div class="h-6 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    class="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                    :style="{ width: ((r.count / maxPickups) * 100).toFixed(1) + '%' }"
                                />
                            </div>
                        </div>
                        <div class="flex justify-between text-[10px] text-muted-foreground">
                            <span>0</span>
                            <span>{{ Math.round(maxPickups * 0.25) }}</span>
                            <span>{{ Math.round(maxPickups * 0.5) }}</span>
                            <span>{{ Math.round(maxPickups * 0.75) }}</span>
                            <span>{{ maxPickups }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
