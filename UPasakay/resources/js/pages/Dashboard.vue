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
import { onMounted, onUnmounted, ref } from 'vue';
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
    shuttles: Array<{
        shuttle_code: string;
        driver: string;
        route: string;
        status: string;
        last_seen: string;
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

onMounted(() => {
    if (!miniMapRef.value) return;

    miniMap = L.map(miniMapRef.value, {
        zoomControl: false,
        attributionControl: false,
    }).setView([10.3157, 123.8854], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(miniMap);

    L.marker([10.3113, 123.9180]).addTo(miniMap).bindTooltip('Pending stop');
    L.marker([10.2987, 123.8942]).addTo(miniMap).bindTooltip('Shuttle SH-001');
});

onUnmounted(() => {
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
