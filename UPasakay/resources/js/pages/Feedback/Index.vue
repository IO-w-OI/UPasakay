<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3';
import { Search, Download, Star, BarChart2, X, Bus, MessageSquare, Check, CheckCircle2 } from 'lucide-vue-next';
import { ChevronRight } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',     href: dashboard().url },
    { title: 'Feedback', href: '/feedback' },
];

const props = defineProps<{
    routes: string[];
    feedback: Array<{
        id: number; passenger: string; rating: number; comment: string;
        route: string; status: string; date: string; replied: boolean;
    }>;
    filters?: { range?: string; reportRoute?: string };
    stats: { total: number; avgRating: number; boardedPct: number; failedPct: number };
    dailyPickups: Array<{ label: string; count: number }>;
    routePerformance: Array<{ name: string; count: number }>;
    shuttleActivity: Array<{ date: string; shuttle: string; driver: string; route: string; start: string; end: string; pickups: number }>;
}>();

const activeTab = ref<'feedback' | 'reports'>('feedback');

// ── Feedback tab ───────────────────────────────────────────────────────────
const searchFb   = ref('');
const ratingFilter = ref('All');
const routeFilter  = ref('All');
const expanded     = ref<number | null>(null);
const replyTarget  = ref<typeof props.feedback[0] | null>(null);
const replyText    = ref('');

const filteredFeedback = computed(() =>
    props.feedback.filter(f =>
        (!searchFb.value || f.passenger.toLowerCase().includes(searchFb.value.toLowerCase())) &&
        (ratingFilter.value === 'All' || f.rating === Number(ratingFilter.value)) &&
        (routeFilter.value === 'All' || f.route === routeFilter.value)
    )
);

// ── Reports tab filters ────────────────────────────────────────────────────
const reportRange = ref(props.filters?.range ?? '7');
const reportRoute = ref(props.filters?.reportRoute ?? 'All');

const applyReportFilters = () => {
    router.get('/feedback', {
        range: reportRange.value,
        reportRoute: reportRoute.value !== 'All' ? reportRoute.value : undefined,
    }, { preserveState: true, replace: true });
};

const sendReply = () => { replyTarget.value = null; replyText.value = ''; };

// ── Reports tab chart helpers ──────────────────────────────────────────────
const maxPickup = computed(() => Math.max(...props.dailyPickups.map(d => d.count), 1));
const maxRoute  = computed(() => Math.max(...props.routePerformance.map(r => r.count), 1));

const RADIUS = 54;
const CIRC   = 2 * Math.PI * RADIUS;
const successDash = computed(() => (props.stats.boardedPct / 100) * CIRC);
const failedDash  = computed(() => (props.stats.failedPct  / 100) * CIRC);
const failedOffset = computed(() => CIRC - successDash.value);

// Helpers
const statusBadge = (s: string) =>
    ({ boarded: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-600' }[s] ?? 'bg-gray-100 text-gray-500');
</script>

<template>
    <Head title="Feedback &amp; Reports" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-6">
            <h1 class="mb-5 text-2xl font-bold text-gray-900">Feedback &amp; Reports</h1>

            <!-- Tabs -->
            <div class="mb-5 flex border-b border-gray-200">
                <button @click="activeTab = 'feedback'"
                    class="px-5 py-2.5 text-sm font-medium transition flex items-center gap-2"
                    :class="activeTab === 'feedback' ? 'border-b-2 border-[#8B0000] text-[#8B0000]' : 'text-gray-500 hover:text-gray-700'">
                    <MessageSquare class="h-4 w-4" />
                    <span>Passenger Feedback</span>
                </button>
                <button @click="activeTab = 'reports'"
                    class="px-5 py-2.5 text-sm font-medium transition flex items-center gap-2"
                    :class="activeTab === 'reports' ? 'border-b-2 border-[#8B0000] text-[#8B0000]' : 'text-gray-500 hover:text-gray-700'">
                    <BarChart2 class="h-4 w-4" />
                    <span>System Reports</span>
                </button>
            </div>

            <!-- ── TAB 1: Passenger Feedback ─────────────────────────────── -->
            <div v-if="activeTab === 'feedback'" class="space-y-5">

                <!-- Stat cards -->
                <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                        <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
                        <p class="mt-1 text-sm text-gray-400">Total Feedback</p>
                    </div>
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                        <p class="text-3xl font-bold text-yellow-500">{{ stats.avgRating }} <Star class="inline-block h-5 w-5 text-yellow-500 ml-2" /></p>
                        <p class="mt-1 text-sm text-gray-400">Avg Rating</p>
                    </div>
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                        <p class="text-3xl font-bold text-green-600">{{ stats.boardedPct }}%</p>
                        <p class="mt-1 text-sm text-gray-400"><Check class="inline-block h-4 w-4 text-green-600 mr-1" />Boarded</p>
                    </div>
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                        <p class="text-3xl font-bold text-red-500">{{ stats.failedPct }}%</p>
                        <p class="mt-1 text-sm text-gray-400"><X class="inline-block h-4 w-4 text-red-500 mr-1" />Failed</p>
                    </div>
                </div>

                <!-- Filter bar -->
                <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div class="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 min-w-48">
                        <Search class="h-4 w-4 text-gray-400 shrink-0" />
                        <input v-model="searchFb" placeholder="Search passenger…"
                            class="flex-1 text-sm outline-none placeholder:text-gray-400" />
                    </div>
                    <select v-model="ratingFilter"
                        class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                        
                        <option value="All">Rating: All</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>

                    </select>
                    <select v-model="routeFilter"
                        class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                        <option value="All">Route: All</option>
                        <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                        <Download class="h-4 w-4" /> Export
                    </button>
                </div>

                <!-- Feedback table -->
                <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-400">
                                <th class="w-6 px-4 py-3"></th>
                                <th class="px-4 py-3">Passenger</th>
                                <th class="px-4 py-3">Rating</th>
                                <th class="px-4 py-3">Comment</th>
                                <th class="px-4 py-3">Ride</th>
                                <th class="px-4 py-3">Date</th>
                                <th class="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="f in filteredFeedback" :key="f.id">
                                <tr class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                                    @click="expanded = expanded === f.id ? null : f.id">
                                    <td class="px-4 py-3 text-gray-400 text-xs">
                                        <ChevronRight class="h-4 w-4 transition" :class="expanded === f.id ? 'rotate-90' : ''" />
                                    </td>
                                    <td class="px-4 py-3 font-medium text-gray-800">{{ f.passenger }}</td>
                                    <td class="px-4 py-3 text-sm">
                                        <span class="flex items-center gap-0.5">
                                            <Star v-for="i in f.rating" :key="i" class="h-4 w-4 text-yellow-500" />
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 max-w-xs truncate text-gray-600">"{{ f.comment }}"</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusBadge(f.status)">
                                            <Check v-if="f.status === 'boarded'" class="inline-block h-3 w-3 text-green-600 mr-1" />
                                            <X v-else class="inline-block h-3 w-3 text-red-500 mr-1" />
                                            {{ f.status === 'boarded' ? 'Boarded' : 'Failed' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-gray-400 text-xs">{{ f.date }}</td>
                                    <td class="px-4 py-3" @click.stop>
                                        <div class="flex gap-1">
                                            <button @click="replyTarget = f; replyText = ''"
                                                class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                                                Reply
                                            </button>
                                            <button class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="expanded === f.id">
                                    <td colspan="7" class="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                        <div class="rounded-xl border border-gray-200 bg-white p-4 text-sm">
                                            <p class="font-semibold text-gray-800 mb-1">{{ f.passenger }}</p>
                                            <p class="text-lg"><span class="flex items-center gap-0.5"><Star v-for="i in f.rating" :key="i" class="h-4 w-4 text-yellow-500" /></span></p>
                                            <p class="mt-1 text-gray-600">"{{ f.comment }}"</p>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                            <tr v-if="filteredFeedback.length === 0">
                                <td colspan="7" class="py-10 text-center text-sm text-gray-400">No feedback found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ── TAB 2: System Reports ──────────────────────────────────── -->
            <div v-if="activeTab === 'reports'" class="space-y-5">

                <!-- Filters -->
                <div class="flex items-center gap-3">
                    <select v-model="reportRange" @change="applyReportFilters" class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="month">This Month</option>
                    </select>
                    <select v-model="reportRoute" @change="applyReportFilters" class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                        <option value="All">Route: All</option>
                        <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                        <Download class="h-4 w-4" /> Export PDF
                    </button>
                </div>

                <!-- Charts row -->
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    <!-- Daily Pickups bar chart -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <BarChart2 class="h-4 w-4 text-gray-400" /> Daily Pickups
                        </h3>
                        <div class="flex h-36 items-end gap-3">
                            <div v-for="d in dailyPickups" :key="d.label" class="flex flex-1 flex-col items-center gap-1">
                                <span class="text-[10px] text-gray-500">{{ d.count }}</span>
                                <div class="w-full rounded-t bg-[#8B0000] transition-all"
                                    :style="{ height: ((d.count / maxPickup) * 100) + '%', minHeight: d.count > 0 ? '4px' : '0' }"></div>
                                <span class="text-[10px] text-gray-400">{{ d.label }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Route Performance -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Bus class="h-4 w-4 text-gray-400" /> Route Performance
                        </h3>
                        <div class="space-y-4">
                            <div v-for="r in routePerformance" :key="r.name">
                                <div class="mb-1 flex items-center justify-between text-xs">
                                    <span class="text-gray-500">{{ r.name }}</span>
                                    <span class="font-medium text-gray-700">{{ r.count }}</span>
                                </div>
                                <div class="h-5 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div class="h-full rounded-full bg-[#1a6b2f] transition-all"
                                        :style="{ width: ((r.count / maxRoute) * 100) + '%' }"></div>
                                </div>
                            </div>
                            <div v-if="routePerformance.length === 0" class="py-4 text-center text-sm text-gray-400">No data yet.</div>
                        </div>
                    </div>

                    <!-- Feedback Rating Trend (static visual) -->
                    <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Star class="h-4 w-4 text-gray-400" /> Feedback Rating Trend
                        </h3>
                        <div class="flex h-28 items-center justify-center text-gray-400 text-sm">
                            Avg rating: <span class="ml-2 text-xl font-bold text-yellow-500">{{ stats.avgRating }} <Star class="inline-block h-5 w-5 text-yellow-500 ml-2" /></span>
                        </div>
                    </div>

                    <!-- Boarding Rate Donut -->
                    <div class="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 class="mb-4 flex w-full items-center gap-2 text-left text-sm font-semibold text-gray-700">
                            <CheckCircle2 class="h-4 w-4 text-gray-400" /> Boarding Rate
                        </h3>
                        <svg width="140" height="140" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="54" fill="none" stroke="#f0f0f0" stroke-width="18"/>
                            
                            <circle cx="70" cy="70" r="54" fill="none" stroke="#ef4444" stroke-width="18"
                                :stroke-dasharray="` ${failedDash} ${CIRC}`" :stroke-dashoffset="0" stroke-linecap="round"/>

                                <circle cx="70" cy="70" r="54" fill="none" stroke="#22c55e" stroke-width="18"
                                :stroke-dasharray="`${successDash} ${CIRC}`" :stroke-dashoffset="`-${failedDash}`" stroke-linecap="round"/>

                            <text x="70" y="66" text-anchor="middle" font-size="20" font-weight="700" fill="#111827">{{ stats.boardedPct }}%</text>
                            <text x="70" y="83" text-anchor="middle" font-size="10" fill="#9ca3af">Success</text>
                        </svg>
                        <div class="mt-2 flex gap-5 text-xs text-gray-600">
                            <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>Boarded {{ stats.boardedPct }}%</span>
                            <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>Failed {{ stats.failedPct }}%</span>
                        </div>
                    </div>
                </div>

                <!-- Shuttle Activity Logs -->
                <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div class="mb-3 flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-gray-700"><Bus class="h-4 w-4 text-gray-400" /> Shuttle Activity Logs</h3>
                        <button class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                            <Download class="h-3.5 w-3.5" /> CSV
                        </button>
                    </div>
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-400">
                                <th class="pb-2 pr-4">Date</th>
                                <th class="pb-2 pr-4">Shuttle</th>
                                <th class="pb-2 pr-4">Driver</th>
                                <th class="pb-2 pr-4">Route</th>
                                <th class="pb-2 pr-4">Session Start</th>
                                <th class="pb-2 pr-4">End</th>
                                <th class="pb-2">Pickups</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(a, i) in shuttleActivity" :key="i"
                                class="border-b border-gray-50 last:border-0">
                                <td class="py-2.5 pr-4 text-gray-500">{{ a.date }}</td>
                                <td class="py-2.5 pr-4 font-medium text-gray-800">{{ a.shuttle }}</td>
                                <td class="py-2.5 pr-4 text-gray-600">{{ a.driver }}</td>
                                <td class="py-2.5 pr-4 text-gray-600">{{ a.route }}</td>
                                <td class="py-2.5 pr-4 text-gray-600">{{ a.start }}</td>
                                <td class="py-2.5 pr-4 text-gray-400">{{ a.end }}</td>
                                <td class="py-2.5 font-semibold text-gray-800">{{ a.pickups }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AppLayout>

    <!-- Reply Drawer -->
    <Teleport to="body">
        <div v-if="replyTarget" class="fixed inset-0 z-50 flex">
            <div class="flex-1 bg-black/30" @click="replyTarget = null"></div>
            <div class="w-full max-w-md bg-white shadow-xl overflow-y-auto">
                <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 class="font-semibold text-gray-900">Reply to {{ replyTarget.passenger }}</h2>
                    <button @click="replyTarget = null"><X class="h-5 w-5 text-gray-400" /></button>
                </div>
                        <div class="p-6 space-y-4">
                    <div class="rounded-xl bg-gray-50 p-4 text-sm">
                        <p class="text-gray-500 mb-1">Their feedback:</p>
                        <p class="text-gray-800">"{{ replyTarget.comment }}"</p>
                        <p class="mt-2 text-lg"><span class="flex items-center gap-0.5"><Star v-for="i in replyTarget.rating" :key="i" class="h-4 w-4 text-yellow-500" /></span></p>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Your Reply</label>
                        <textarea v-model="replyText" rows="5"
                            placeholder="We're sorry for the inconvenience…"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000] resize-none"></textarea>
                    </div>
                    <div class="flex justify-end gap-3">
                        <button @click="replyTarget = null"
                            class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button @click="sendReply"
                            class="rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] flex items-center gap-2">
                            <Check class="h-4 w-4" />
                            <span>Send Reply</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
