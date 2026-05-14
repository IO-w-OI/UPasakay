<script setup lang="ts">
import { Head, router, useForm } from '@inertiajs/vue3';
import axios from 'axios';
import * as L from 'leaflet';
import { Map as MapIcon, Bus, MapPin, RefreshCw, ArrowRight, Plus, Trash2, X, Search, Lock, Pencil, Check } from 'lucide-vue-next';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useAppearance } from '@/composables/useAppearance';
import { liveMapRoutes, type RouteConfig } from '@/data/routeData';
import { echo } from '@/echo';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geometryutil';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Live Map', href: '/live-map' },
];

type RouteName = 'North' | 'South' | 'Cebu City';

interface RouteItem {
    id: number;
    name: RouteName;
}

interface StopItem {
    id: number;
    route_id: number;
    name: string;
    sequence: number;
    latitude: number;
    longitude: number;
    is_active: boolean;
    route: RouteItem | null;
    route_name?: RouteName | null;
}

interface ShuttleItem {
    id: number;
    code: string;
    driver: string;
    route: string;
    status: string;
    speed: number;
    last_seen: string;
    latitude: number | null;
    longitude: number | null;
}

interface PendingRequestItem {
    id: number;
    passenger: string;
    route: string;
    stop: string;
    time: string;
}

interface NominatimReverseResponse {
    name?: string;
    display_name?: string;
    address?: {
        amenity?: string;
        building?: string;
        road?: string;
        neighbourhood?: string;
        suburb?: string;
        quarter?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
    };
}

const props = defineProps<{
    shuttles: ShuttleItem[];
    pendingRequests: PendingRequestItem[];
    routes: RouteItem[];
    stops: StopItem[];
}>();

// Filter / search — fixed route list
const availableRoutes = ref([
    { id: 'all',       name: 'All Routes' },
    { id: 'north',     name: 'North Route' },
    { id: 'south',     name: 'South Route' },
    { id: 'cebu_city', name: 'Cebu City Route' },
]);
const selectedRoute = ref('all');

// Map dropdown id → shuttle label used by existing computed logic
const routeIdToLabel: Record<string, string> = {
    all: 'All', north: 'North', south: 'South', cebu_city: 'Cebu City', demo: 'All',
};
const routeFilter = computed(() => routeIdToLabel[selectedRoute.value] ?? 'All');

const searchQuery  = ref('');
const autoRefresh  = ref(true);

// Local copy so Pusher updates can mutate coordinates without touching props
const localShuttles = ref(props.shuttles.map(s => ({ ...s })));

const filtered = computed(() =>
    localShuttles.value.filter(s => {
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

const routeBadge = (route: string) =>
    ({ South: 'bg-green-500/15 text-green-600 dark:text-green-400', North: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', 'Cebu City': 'bg-orange-500/15 text-orange-600 dark:text-orange-400' }[route] ?? 'bg-muted text-muted-foreground');

const activeCount = computed(() => localShuttles.value.filter(s => s.status === 'active').length);

const filteredRequests = computed(() => {
    const list = routeFilter.value === 'All'
        ? props.pendingRequests
        : props.pendingRequests.filter(r => r.route === routeFilter.value);
    return list.slice(0, 5);
});

// ── Edit mode ─────────────────────────────────────────────────────────────
type RouteKey = 'north' | 'south' | 'cebu_city';

const routeKeyToName: Record<RouteKey, RouteName> = {
    north: 'North',
    south: 'South',
    cebu_city: 'Cebu City',
};

const activeRouteTab = ref<RouteKey>('north');
const showAddStopForm = ref(false);
const isGeocodingStopName = ref(false);
const stopFormError = ref('');

const stopForm = useForm({
    route_id: null as number | null,
    name: '',
    latitude: 0 as number,
    longitude: 0 as number,
});

// Map route key to route ID by matching with database routes by name
const routeKeyToId = computed(() => {
    const mapping: Record<RouteKey, number | null> = { north: null, south: null, cebu_city: null };
    for (const [key, name] of Object.entries(routeKeyToName)) {
        const route = props.routes.find(r => r.name === name);
        if (route) mapping[key as RouteKey] = route.id;
    }
    return mapping;
});

// ── Place search (Nominatim forward geocoding) ───────────────────────────
interface PlaceResult { display_name: string; lat: string; lon: string; place_id: number }
const placeSearch = ref('');
const placeResults = ref<PlaceResult[]>([]);
const isSearchingPlace = ref(false);
const showPlaceDropdown = ref(false);
let placeSearchTimer: ReturnType<typeof setTimeout> | null = null;
let previewMarker: L.Marker | null = null;

function clearPreviewMarker() {
    if (previewMarker && map) {
        previewMarker.remove();
        previewMarker = null;
    }
}

function setPreviewMarker(lat: number, lng: number) {
    if (!map) return;
    clearPreviewMarker();
    previewMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: '',
            html: '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        }),
    }).addTo(map);
    map.panTo([lat, lng]);
}

function onPlaceSearchInput() {
    if (placeSearchTimer) clearTimeout(placeSearchTimer);
    const q = placeSearch.value.trim();
    if (!q) {
        placeResults.value = [];
        showPlaceDropdown.value = false;
        return;
    }
    placeSearchTimer = setTimeout(async () => {
        isSearchingPlace.value = true;
        try {
            const { data } = await axios.get<PlaceResult[]>('https://nominatim.openstreetmap.org/search', {
                params: {
                    q,
                    format: 'json',
                    limit: 5,
                    viewbox: '123.7,10.5,124.1,10.1',
                    bounded: 1,
                },
            });
            placeResults.value = data ?? [];
            showPlaceDropdown.value = true;
        } catch {
            placeResults.value = [];
        } finally {
            isSearchingPlace.value = false;
        }
    }, 350);
}

function selectPlaceResult(r: PlaceResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    stopForm.latitude = lat;
    stopForm.longitude = lng;
    stopForm.name = r.display_name.split(',')[0].trim();
    placeSearch.value = '';
    placeResults.value = [];
    showPlaceDropdown.value = false;
    setPreviewMarker(lat, lng);
}

function extractStopName(response: NominatimReverseResponse, fallbackLatlng: L.LatLng): string {
    const candidates = [
        response.name,
        response.address?.amenity,
        response.address?.building,
        response.address?.road,
        response.address?.neighbourhood,
        response.address?.suburb,
        response.address?.quarter,
        response.address?.city,
        response.address?.town,
        response.address?.municipality,
        response.address?.village,
        response.display_name,
    ];
    const firstMatch = candidates.find(v => v?.trim());
    return firstMatch?.trim() ?? `Custom Stop ${fallbackLatlng.lat.toFixed(5)}, ${fallbackLatlng.lng.toFixed(5)}`;
}

async function fetchReverseGeocode(latlng: L.LatLng) {
    isGeocodingStopName.value = true;
    try {
        const { data } = await axios.get<NominatimReverseResponse>('https://nominatim.openstreetmap.org/reverse', {
            params: { format: 'jsonv2', lat: latlng.lat, lon: latlng.lng, addressdetails: 1 },
        });
        stopForm.name = extractStopName(data, latlng);
    } catch {
        stopForm.name = `Custom Stop ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
    } finally {
        isGeocodingStopName.value = false;
    }
}

function openAddStopForm() {
    stopFormError.value = '';
    stopForm.clearErrors();
    stopForm.reset();
    const routeId = routeKeyToId.value[activeRouteTab.value];
    if (!routeId) {
        stopFormError.value = `Route "${routeKeyToName[activeRouteTab.value]}" not found in database. Run route seeder first.`;
    }
    stopForm.route_id = routeId;
    stopForm.latitude = 0;
    stopForm.longitude = 0;
    stopForm.name = '';
    placeSearch.value = '';
    placeResults.value = [];
    showAddStopForm.value = true;
}

function closeAddStopForm() {
    showAddStopForm.value = false;
    stopFormError.value = '';
    stopForm.clearErrors();
    placeSearch.value = '';
    placeResults.value = [];
    clearPreviewMarker();
    if (map) map.getContainer().style.cursor = '';
}

function submitStop() {
    if (!stopForm.route_id) {
        stopFormError.value = 'No route selected.';
        return;
    }
    if (!stopForm.latitude || !stopForm.longitude) {
        stopFormError.value = 'Pick a location — search a place or click on the map.';
        return;
    }
    if (!stopForm.name.trim()) {
        stopFormError.value = 'Enter a stop name.';
        return;
    }
    stopForm.post('/live-map/stops', {
        preserveScroll: true,
        onSuccess: () => closeAddStopForm(),
    });
}

function confirmDeleteStop(stop: StopItem) {
    if (!window.confirm(`Delete stop "${stop.name}"? This cannot be undone.`)) return;
    router.delete(`/live-map/stops/${stop.id}`, { preserveScroll: true });
}

// ── Inline rename ────────────────────────────────────────────────────────
const editingStopId = ref<number | null>(null);
const editingStopName = ref('');
const renameForm = useForm({ name: '' });

function startEditStop(stop: StopItem) {
    editingStopId.value = stop.id;
    editingStopName.value = stop.name;
}
function cancelEditStop() {
    editingStopId.value = null;
    editingStopName.value = '';
}
function saveEditStop(stop: StopItem) {
    const newName = editingStopName.value.trim();
    if (!newName || newName === stop.name) {
        cancelEditStop();
        return;
    }
    renameForm.name = newName;
    renameForm.patch(`/live-map/stops/${stop.id}`, {
        preserveScroll: true,
        onSuccess: () => cancelEditStop(),
    });
}

const routeGroupDefs = [
    { key: 'north', routeName: 'North', label: 'North Route', dot: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
    { key: 'south', routeName: 'South', label: 'South Route', dot: 'bg-green-500', badge: 'bg-green-500/15 text-green-700 dark:text-green-300' },
    { key: 'cebu_city', routeName: 'Cebu City', label: 'Cebu City Route', dot: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300' },
] as const;

const routeNameToColor: Record<RouteName, string> = {
    North: '#3b82f6',
    South: '#22c55e',
    'Cebu City': '#f97316',
};

// Merge hardcoded landmarks from routeData.ts with database stops
const allStopsByRoute = computed(() => {
    const grouped: Record<RouteName, (StopItem & { isCustom: boolean })[]> = {
        North: [],
        South: [],
        'Cebu City': [],
    };

    // Add hardcoded landmarks from liveMapRoutes (marked as non-deletable)
    const routeKeyToRoute: Record<'north' | 'south' | 'cebu_city', RouteName> = {
        north: 'North',
        south: 'South',
        cebu_city: 'Cebu City',
    };

    for (const [key, routeName] of Object.entries(routeKeyToRoute)) {
        const dataKey = key === 'cebu_city' ? 'cebuCity' : key;
        const routeConfig = liveMapRoutes[dataKey as 'cebuCity' | 'north' | 'south'];
        if (routeConfig && routeConfig.landmarks) {
            routeConfig.landmarks.forEach((landmark, idx) => {
                grouped[routeName].push({
                    id: -1,  // Marker for hardcoded landmark (negative ID = not deletable)
                    route_id: -1,
                    name: landmark.name,
                    sequence: idx + 1,
                    latitude: landmark.coord[0],
                    longitude: landmark.coord[1],
                    is_active: true,
                    route: null,
                    route_name: routeName,
                    isCustom: false,  // Cannot delete hardcoded landmarks
                } as StopItem & { isCustom: boolean });
            });
        }
    }

    // Append database stops (marked as deletable)
    props.stops.forEach((stop) => {
        const routeName = stop.route?.name ?? stop.route_name;
        if (routeName && grouped[routeName]) {
            grouped[routeName].push({
                ...stop,
                isCustom: true,  // Can delete database stops
            });
        }
    });

    return grouped;
});

//  Leaflet map
const mapRef = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
const shuttleMarkers = new Map<number, L.Marker>();
const otherMarkers: L.Marker[] = [];
const customStopMarkers = new Map<number, L.CircleMarker>();

// Named polyline refs for geofenced custom-stop distance checks
/** Smooth marker moves between ~5s GPS updates (CSS on Leaflet icon element). */
const SHUTTLE_MARKER_MOVE_MS = 600;

function applyShuttleMarkerMove(marker: L.Marker, lat: number, lng: number): void {
    const el = marker.getElement();
    if (el) {
        el.style.transition = `transform ${SHUTTLE_MARKER_MOVE_MS}ms ease-out`;
    }
    marker.setLatLng([lat, lng]);
}

function syncCustomStopMarkers() {
    if (!map) return;

    customStopMarkers.forEach((marker) => marker.remove());
    customStopMarkers.clear();

    props.stops.forEach((stop) => {
        if (!stop.is_active || !stop.route) {
            return;
        }

        const color = routeNameToColor[stop.route.name];
        const marker = L.circleMarker([stop.latitude, stop.longitude], {
            radius: 7,
            color,
            fillColor: color,
            fillOpacity: 1,
            weight: 2,
            bubblingMouseEvents: false,
        })
            .bindPopup(`<div style="font-size:13px;"><b>${stop.name}</b><br>Route: ${stop.route?.name ?? '—'}<br><span style="font-size:11px;color:#6b7280;">Stop #${stop.sequence}</span></div>`)
            .addTo(map!);

        customStopMarkers.set(stop.id, marker);
    });
}

// Ride accepted toast (admin-rides channel)
type AcceptedToast = {
    pickup_request_id: number;
    driver_name: string | null;
    eta_minutes: number | null;
};
const acceptedToast = ref<AcceptedToast | null>(null);
let acceptedToastTimer: ReturnType<typeof setTimeout> | null = null;

function showAcceptedToast(payload: AcceptedToast): void {
    if (acceptedToastTimer) {
        clearTimeout(acceptedToastTimer);
        acceptedToastTimer = null;
    }
    acceptedToast.value = payload;
    acceptedToastTimer = setTimeout(() => {
        acceptedToast.value = null;
        acceptedToastTimer = null;
    }, 5000);
}

// Echo real-time connection (uses resources/js/echo.ts)

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
        const shuttleMarker = L.marker([lat, lng], { icon: makeShuttleIcon(s.status), bubblingMouseEvents: false })
            .bindPopup(`<div style="font-size:13px;"><b>${s.code}</b><br>Driver: ${s.driver}<br>Route: ${s.route}<br>Speed: ${s.speed} km/h<br>Status: ${s.status}</div>`)
            .addTo(map!);
        shuttleMarker.on('click', () => selectShuttle(s));
        shuttleMarkers.set(s.id, shuttleMarker);
    });

    const visibleRequests = routeFilter.value === 'All'
        ? props.pendingRequests.slice(0, 8)
        : props.pendingRequests.filter(r => r.route === routeFilter.value).slice(0, 8);

    visibleRequests.forEach((r, i) => {
        const lat = 10.3140 + (i * 0.003);
        const lng = 123.8870 + (i * 0.004);
        const m = L.marker([lat, lng], { icon: passengerIcon, bubblingMouseEvents: false })
            .bindPopup(`<div style="font-size:13px;"><b>#${r.id}</b> ${r.passenger}<br>${r.route} - ${r.stop}</div>`)
            .addTo(map!);
        otherMarkers.push(m);
    });
};

watch(filtered, () => syncMarkers());
watch(
    () => props.stops,
    () => syncCustomStopMarkers(),
    { deep: true },
);
watch(showAddStopForm, (active) => {
    if (map) {
        map.getContainer().style.cursor = active ? 'crosshair' : '';
    }
});

// Route data (imported from @/data/routeData)
const routeStops: RouteConfig = liveMapRoutes;


const routePolylines = new Map<string, L.Polyline>();
const routeStopMarkers = new Map<string, L.CircleMarker[]>();

const filterKeyToRouteKey: Record<string, string> = {
    'South': 'south',
    'North': 'north',
    'Cebu City': 'cebu_city',
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
        syncCustomStopMarkers();

        // ── Map click: only fires when Add Stop form is open ─────────────────
        map!.on('click', (e: L.LeafletMouseEvent) => {
            if (!showAddStopForm.value) return;
            stopForm.latitude = e.latlng.lat;
            stopForm.longitude = e.latlng.lng;
            setPreviewMarker(e.latlng.lat, e.latlng.lng);
            void fetchReverseGeocode(e.latlng);
        });
    });

    // Real-time shuttle location via Echo
    if ((echo as any)) {
        const channel = echo.channel('shuttle-locations');
        channel.listen('.location.updated', (data: { id?: number; shuttle_id?: number; latitude: number; longitude: number; status?: string }) => {
            const shuttleId = data.id ?? data.shuttle_id;
            const shuttle = shuttleId !== undefined
                ? localShuttles.value.find(s => s.id === shuttleId)
                : localShuttles.value[0];
            if (!shuttle) return;
            shuttle.latitude = data.latitude;
            shuttle.longitude = data.longitude;
            if (data.status) shuttle.status = data.status;
            const marker = shuttleMarkers.get(shuttle.id);
            if (marker) {
                applyShuttleMarkerMove(marker, data.latitude, data.longitude);
                marker.setIcon(makeShuttleIcon(shuttle.status));
            } else if (map) {
                const m = L.marker([data.latitude, data.longitude], { icon: makeShuttleIcon(shuttle.status) })
                    .bindPopup(`<div style="font-size:13px;"><b>${shuttle.code}</b><br>Driver: ${shuttle.driver}<br>Route: ${shuttle.route}</div>`)
                    .addTo(map);
                shuttleMarkers.set(shuttle.id, m);
            }
        });

        const adminRides = echo.channel('admin-rides');
        adminRides.listen('.ride.accepted', (e: {
            pickup_request_id: number;
            driver_name?: string | null;
            eta_minutes?: number | null;
        }) => {
            showAcceptedToast({
                pickup_request_id: e.pickup_request_id,
                driver_name: e.driver_name ?? null,
                eta_minutes: e.eta_minutes ?? null,
            });
        });
    }
});

onUnmounted(() => {
    if (acceptedToastTimer) {
        clearTimeout(acceptedToastTimer);
        acceptedToastTimer = null;
    }
    acceptedToast.value = null;
    try { echo.leave('shuttle-locations'); } catch {}
    try { echo.leave('admin-rides'); } catch {}
    shuttleMarkers.forEach(m => m.remove());
    shuttleMarkers.clear();
    otherMarkers.forEach(m => m.remove());
    otherMarkers.length = 0;
    routePolylines.forEach(pl => pl.remove());
    routePolylines.clear();
    routeStopMarkers.forEach(markers => markers.forEach(cm => cm.remove()));
    routeStopMarkers.clear();
    customStopMarkers.forEach(marker => marker.remove());
    customStopMarkers.clear();
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
                    v-model="selectedRoute"
                    class="rounded-lg border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground shadow-sm shadow-black/5 dark:shadow-black/20 focus:outline-none"
                >
                    <option v-for="r in availableRoutes" :key="r.id" :value="r.id">{{ r.name }}</option>
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

                    <!-- Ride accepted (admin) toast -->
                    <div
                        v-if="acceptedToast"
                        class="pointer-events-none absolute right-4 top-4 z-[1000] max-w-sm rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-900 shadow-lg backdrop-blur-sm dark:border-emerald-400/30 dark:bg-emerald-950/80 dark:text-emerald-100"
                    >
                        <p class="font-semibold">Shuttle on the way!</p>
                        <p class="mt-1 text-xs opacity-90">
                            Pickup #{{ acceptedToast.pickup_request_id }} accepted
                            <span v-if="acceptedToast.driver_name"> — {{ acceptedToast.driver_name }}</span>
                            <span v-if="acceptedToast.eta_minutes != null"> — ETA ~{{ acceptedToast.eta_minutes }} min</span>
                        </p>
                    </div>

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
                        Click a shuttle/pin for details &middot; Use <b>Add Stop</b> in the sidebar to pinpoint or search a place &middot; Shift-scroll to zoom
                    </div>
                </div>

                <!-- Right sidebar -->
                <div class="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto">

                    <!-- Route Stops panel with tabs -->
                    <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">
                        <div class="flex items-center justify-between px-4 py-3">
                            <p class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Route Stops</p>
                            <button
                                v-if="!showAddStopForm"
                                type="button"
                                class="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                @click="openAddStopForm"
                            >
                                <Plus class="h-3 w-3" /> Add Stop
                            </button>
                        </div>

                        <!-- Tabs -->
                        <div class="flex gap-1 border-b border-border/40 px-2">
                            <button
                                v-for="group in routeGroupDefs"
                                :key="group.key"
                                type="button"
                                class="flex-1 rounded-t-lg px-2 py-2 text-[11px] font-semibold transition"
                                :class="activeRouteTab === group.key
                                    ? group.badge + ' border-b-2 border-current -mb-px'
                                    : 'text-muted-foreground hover:bg-accent/40'"
                                @click="activeRouteTab = group.key"
                            >
                                <span class="flex items-center justify-center gap-1.5">
                                    <span :class="['h-2 w-2 rounded-full', group.dot]" />
                                    {{ group.routeName }}
                                </span>
                            </button>
                        </div>

                        <!-- Stops list (active tab) -->
                        <ul class="max-h-72 space-y-0.5 overflow-y-auto px-3 py-3">
                            <template
                                v-for="group in routeGroupDefs"
                                :key="group.key"
                            >
                                <li
                                    v-for="stop in allStopsByRoute[group.routeName]"
                                    v-show="activeRouteTab === group.key"
                                    :key="`${stop.id}-${stop.name}`"
                                    class="group flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition hover:bg-accent/60"
                                >
                                    <span class="flex min-w-0 flex-1 items-start gap-1.5">
                                        <Lock v-if="!stop.isCustom" class="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/60" />
                                        <MapPin v-else class="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                                        <span class="min-w-0 flex-1">
                                            <!-- Inline rename -->
                                            <span v-if="editingStopId === stop.id" class="flex items-center gap-1">
                                                <input
                                                    v-model="editingStopName"
                                                    type="text"
                                                    class="w-full rounded border border-border/70 bg-background px-1.5 py-0.5 text-xs text-foreground outline-none focus:border-blue-500"
                                                    @keyup.enter="saveEditStop(stop as StopItem)"
                                                    @keyup.escape="cancelEditStop"
                                                />
                                                <button @click.stop="saveEditStop(stop as StopItem)" class="rounded p-0.5 text-green-600 hover:bg-green-500/10" title="Save">
                                                    <Check class="h-3 w-3" />
                                                </button>
                                                <button @click.stop="cancelEditStop" class="rounded p-0.5 text-muted-foreground hover:bg-accent" title="Cancel">
                                                    <X class="h-3 w-3" />
                                                </button>
                                            </span>
                                            <span v-else>
                                                <span class="block truncate font-medium text-foreground">{{ stop.name }}</span>
                                                <span class="block text-[10px] text-muted-foreground/70">Stop #{{ stop.sequence }}</span>
                                            </span>
                                        </span>
                                    </span>
                                    <span v-if="stop.isCustom && editingStopId !== stop.id" class="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                                        <button
                                            type="button"
                                            class="rounded-md p-1 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500"
                                            title="Rename"
                                            @click.stop="startEditStop(stop as StopItem)"
                                        >
                                            <Pencil class="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-md p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                                            title="Delete"
                                            @click.stop="confirmDeleteStop(stop as StopItem)"
                                        >
                                            <Trash2 class="h-3 w-3" />
                                        </button>
                                    </span>
                                </li>
                                <li v-if="activeRouteTab === group.key && !allStopsByRoute[group.routeName].length" class="py-2 text-center text-[11px] italic text-muted-foreground/50">
                                    No stops defined
                                </li>
                            </template>
                        </ul>

                        <!-- Inline add stop form -->
                        <div v-if="showAddStopForm" class="border-t border-border/40 px-4 py-3 space-y-3 bg-accent/20">
                            <div class="flex items-center justify-between">
                                <p class="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                                    Add to {{ routeKeyToName[activeRouteTab] }} Route
                                </p>
                                <button @click="closeAddStopForm" class="rounded p-0.5 hover:bg-accent">
                                    <X class="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                            </div>

                            <!-- Place search -->
                            <div class="relative">
                                <div class="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5">
                                    <Search class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <input
                                        v-model="placeSearch"
                                        type="text"
                                        placeholder="Search a place (e.g. SM Cebu)"
                                        class="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                                        @input="onPlaceSearchInput"
                                        @focus="showPlaceDropdown = placeResults.length > 0"
                                    />
                                    <span v-if="isSearchingPlace" class="text-[10px] text-muted-foreground">…</span>
                                </div>
                                <div
                                    v-if="showPlaceDropdown && placeResults.length"
                                    class="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border/70 bg-card shadow-lg"
                                >
                                    <button
                                        v-for="r in placeResults"
                                        :key="r.place_id"
                                        type="button"
                                        class="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-accent"
                                        @click="selectPlaceResult(r)"
                                    >
                                        {{ r.display_name }}
                                    </button>
                                </div>
                            </div>

                            <p class="text-center text-[10px] text-muted-foreground">— or click anywhere on the map —</p>

                            <!-- Stop name -->
                            <div>
                                <label class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Stop Name</label>
                                <input
                                    v-model="stopForm.name"
                                    type="text"
                                    class="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500"
                                    :placeholder="isGeocodingStopName ? 'Resolving place…' : 'Enter stop name'"
                                />
                                <p v-if="stopForm.errors.name" class="mt-0.5 text-[10px] text-red-500">{{ stopForm.errors.name }}</p>
                            </div>

                            <!-- Coordinate preview -->
                            <p v-if="stopForm.latitude && stopForm.longitude" class="rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-[10px] font-mono text-blue-700 dark:text-blue-300">
                                📍 {{ stopForm.latitude.toFixed(5) }}, {{ stopForm.longitude.toFixed(5) }}
                            </p>

                            <p v-if="stopFormError" class="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                                {{ stopFormError }}
                            </p>

                            <div class="flex gap-2">
                                <button
                                    type="button"
                                    class="flex-1 rounded-lg border border-border/70 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-accent"
                                    @click="closeAddStopForm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    class="flex-1 rounded-lg bg-blue-600 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    :disabled="stopForm.processing || isGeocodingStopName"
                                    @click="submitStop"
                                >
                                    {{ stopForm.processing ? 'Saving…' : 'Add Stop' }}
                                </button>
                            </div>
                        </div>
                    </div>

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

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.97);
}
</style>
