<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import {
    AlertTriangle, Bell, Calendar, Check, Clock, Search,
    Send, Zap, RefreshCw, Trash2, Eye, Users, UserCheck,
    BarChart3, TrendingUp, Plus, Bus,
} from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',          href: dashboard().url },
    { title: 'Notifications', href: '/notifications' },
];

const props = defineProps<{
    routes: string[];
    notificationLog: Array<{ time: string; type: string; label: string; target: string; status: string; date: string }>;
    scheduledNotifications: Array<{ id: number; title: string; schedule: string; target: string; auto: boolean; active: boolean }>;
}>();

// ── Smart Templates ────────────────────────────────────────────────────────
const templates = [
    { name: 'Delay Notice', type: 'Route Delay', title: 'Route Delay Notice', message: 'Shuttle service on this route is currently delayed by approximately 15 minutes. We apologize for the inconvenience.' },
    { name: 'Shuttle Available', type: 'Shuttle Availability', title: 'Shuttle Now Available', message: 'A shuttle is now available on this route. Check the app for real-time location updates.' },
    { name: 'Service Suspended', type: 'Service Announcement', title: 'Service Temporarily Suspended', message: 'Shuttle service has been temporarily suspended. We will notify you when service resumes.' },
    { name: 'Route Change', type: 'Route Change', title: 'Route Change Notice', message: 'The route has been updated. Please check the app for the latest stops and schedule.' },
];

// ── Form ───────────────────────────────────────────────────────────────────
const form = ref({
    title: '',
    type: 'Shuttle Availability',
    targetRoute: 'all',
    audience: 'all' as 'all' | 'passengers' | 'drivers',
    message: '',
});
const charCount = computed(() => form.value.message.length);
const charLimitClass = computed(() => charCount.value > 140 ? 'text-red-500' : 'text-muted-foreground');
const canSend = computed(() => form.value.title.trim() !== '' && form.value.message.trim() !== '');

const applyTemplate = (t: typeof templates[0]) => {
    form.value.type = t.type;
    form.value.title = t.title;
    form.value.message = t.message;
};

// ── Preview ────────────────────────────────────────────────────────────────
const preview = computed(() => ({
    title: form.value.title || 'UPasakay',
    body: form.value.message || 'Your notification preview will appear here.',
}));

// ── Send ───────────────────────────────────────────────────────────────────
const isSending = ref(false);
const showSuccess = ref(false);
const showConfirmSend = ref(false);

const openSendConfirm = () => { if (canSend.value) showConfirmSend.value = true; };
const send = () => {
    showConfirmSend.value = false;
    isSending.value = true;
    setTimeout(() => {
        isSending.value = false;
        showSuccess.value = true;
        form.value = { title: '', type: 'Shuttle Availability', targetRoute: 'all', audience: 'all', message: '' };
        setTimeout(() => { showSuccess.value = false; }, 3000);
    }, 1200);
};

// ── Log ────────────────────────────────────────────────────────────────────
const logSearch = ref('');
const typeFilter = ref('All');
const filteredLog = computed(() =>
    props.notificationLog.filter(n =>
        (typeFilter.value === 'All' || n.type === typeFilter.value) &&
        (!logSearch.value || n.label.toLowerCase().includes(logSearch.value.toLowerCase()) ||
            n.target.toLowerCase().includes(logSearch.value.toLowerCase()))
    )
);

const typeIconComponent = (t: string) =>
    ({ schedule: Calendar, delay: Clock, change: AlertTriangle }[t] ?? Bell);

const typeBadgeClass = (t: string) =>
    ({ schedule: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', delay: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', change: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' }[t] ?? 'bg-muted text-muted-foreground');

// ── Scheduled ──────────────────────────────────────────────────────────────
const localScheduled = ref(props.scheduledNotifications.map(sn => ({ ...sn })));
const toggleScheduled = (id: number) => {
    const item = localScheduled.value.find(s => s.id === id);
    if (item) item.active = !item.active;
};

// ── Analytics (mock) ───────────────────────────────────────────────────────
const analytics = computed(() => {
    const counts: Record<string, number> = {};
    props.notificationLog.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
    const mostUsed = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—';
    return {
        sentToday: props.notificationLog.filter(n => n.date === 'Today').length,
        totalSent: props.notificationLog.length,
        mostUsedType: mostUsed,
    };
});

const audienceOptions = [
    { val: 'all' as const, label: 'All Users', icon: Users },
    { val: 'passengers' as const, label: 'Passengers', icon: UserCheck },
    { val: 'drivers' as const, label: 'Drivers', icon: Bus },
];
</script>

<template>
    <Head title="Notifications" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-6 space-y-6">
            <h1 class="text-2xl font-bold text-foreground">Notifications</h1>

            <!-- Analytics Strip -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
                        <Send class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-foreground">{{ analytics.sentToday }}</p>
                        <p class="text-xs text-muted-foreground">Sent Today</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                        <TrendingUp class="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-foreground">{{ analytics.totalSent }}</p>
                        <p class="text-xs text-muted-foreground">Total Sent</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
                        <BarChart3 class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-foreground capitalize">{{ analytics.mostUsedType }}</p>
                        <p class="text-xs text-muted-foreground">Most Used Type</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">

                <!-- Left: Send Notification -->
                <div class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-black/5 dark:shadow-black/20 space-y-4">
                    <h2 class="font-semibold text-foreground">Send Notification</h2>

                    <!-- Smart Templates -->
                    <div>
                        <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick Templates</label>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="t in templates" :key="t.name" @click="applyTemplate(t)"
                                class="flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                <Zap class="h-3 w-3" /> {{ t.name }}
                            </button>
                        </div>
                    </div>

                    <!-- Title -->
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Title *</label>
                        <input v-model="form.title" type="text" placeholder="Notification title…"
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000] placeholder:text-muted-foreground" />
                    </div>

                    <!-- Type -->
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Type *</label>
                        <select v-model="form.type"
                            class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option>Shuttle Availability</option>
                            <option>Route Delay</option>
                            <option>Route Change</option>
                            <option>Service Announcement</option>
                        </select>
                    </div>

                    <!-- Target Route — Pill selector -->
                    <div>
                        <label class="mb-2 block text-sm font-medium text-foreground">Target Route *</label>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="opt in [{ val: 'all', label: 'All Routes' }, ...routes.map(r => ({ val: r, label: r }))]"
                                :key="opt.val"
                                @click="form.targetRoute = opt.val"
                                class="rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors"
                                :class="form.targetRoute === opt.val
                                    ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] dark:text-red-300'
                                    : 'border-border/70 text-muted-foreground hover:bg-accent'">
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Audience -->
                    <div>
                        <label class="mb-2 block text-sm font-medium text-foreground">Audience</label>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="a in audienceOptions" :key="a.val"
                                @click="form.audience = a.val"
                                class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors"
                                :class="form.audience === a.val
                                    ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] dark:text-red-300'
                                    : 'border-border/70 text-muted-foreground hover:bg-accent'">
                                <component :is="a.icon" class="h-3.5 w-3.5" />
                                {{ a.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Message -->
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Message *</label>
                        <div class="relative">
                            <textarea v-model="form.message" maxlength="160" rows="4"
                                placeholder="e.g. Shuttle SH-001 will be delayed by 15 minutes due to road works."
                                class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000] resize-none placeholder:text-muted-foreground"></textarea>
                            <span class="absolute bottom-2 right-3 text-xs" :class="charLimitClass">{{ charCount }}/160</span>
                        </div>
                    </div>

                    <!-- Mobile Preview -->
                    <div>
                        <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Mobile Preview</label>
                        <div class="mx-auto w-72 rounded-2xl border border-border/70 bg-muted/30 p-3 shadow-inner">
                            <div class="rounded-xl bg-card border border-border/50 p-3 shadow-sm">
                                <div class="flex items-center gap-2 mb-1.5">
                                    <div class="flex h-6 w-6 items-center justify-center rounded-md bg-[#8B0000]">
                                        <Bell class="h-3 w-3 text-white" />
                                    </div>
                                    <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">UPasakay</span>
                                    <span class="ml-auto text-[10px] text-muted-foreground">now</span>
                                </div>
                                <p class="text-xs font-semibold text-foreground leading-snug">{{ preview.title }}</p>
                                <p class="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{{ preview.body }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end gap-3 pt-2">
                        <button @click="form = { title: '', type: 'Shuttle Availability', targetRoute: 'all', audience: 'all', message: '' }"
                            class="rounded-xl border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Clear
                        </button>
                        <button @click="openSendConfirm" :disabled="!canSend || isSending"
                            class="flex items-center gap-2 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            <Send v-if="!isSending" class="h-4 w-4" />
                            <RefreshCw v-else class="h-4 w-4 animate-spin" />
                            {{ isSending ? 'Sending...' : 'Send Now' }}
                        </button>
                    </div>
                </div>

                <!-- Right column -->
                <div class="space-y-5">
                    <!-- Notification Log -->
                    <div class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-black/5 dark:shadow-black/20">
                        <h2 class="mb-3 font-semibold text-foreground">Notification Log</h2>
                        <div class="mb-3 flex gap-2">
                            <div class="flex flex-1 items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
                                <Search class="h-4 w-4 text-muted-foreground shrink-0" />
                                <input v-model="logSearch" placeholder="Search…"
                                    class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                            </div>
                            <select v-model="typeFilter"
                                class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                                <option value="All">Type: All</option>
                                <option value="schedule">Schedule</option>
                                <option value="delay">Delay</option>
                                <option value="change">Change</option>
                            </select>
                        </div>

                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-xs font-medium uppercase text-muted-foreground border-b border-border/50">
                                    <th class="pb-2 pr-3">Time</th>
                                    <th class="pb-2 pr-3">Type</th>
                                    <th class="pb-2 pr-3">Target</th>
                                    <th class="pb-2 pr-3">Status</th>
                                    <th class="pb-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(n, i) in filteredLog" :key="i"
                                    class="border-b border-border/30 last:border-0">
                                    <td class="py-2.5 pr-3 text-muted-foreground text-xs">
                                        <div>{{ n.time }}</div>
                                        <div class="text-muted-foreground/70">{{ n.date }}</div>
                                    </td>
                                    <td class="py-2.5 pr-3">
                                        <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" :class="typeBadgeClass(n.type)">
                                            <component :is="typeIconComponent(n.type)" class="h-3 w-3" />
                                            {{ n.label }}
                                        </span>
                                    </td>
                                    <td class="py-2.5 pr-3 text-muted-foreground text-sm">{{ n.target }}</td>
                                    <td class="py-2.5 pr-3">
                                        <span class="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                            <Check class="inline-block h-3 w-3 mr-0.5" />Sent
                                        </span>
                                    </td>
                                    <td class="py-2.5">
                                        <div class="flex items-center gap-1">
                                            <button class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="View">
                                                <Eye class="h-3.5 w-3.5" />
                                            </button>
                                            <button class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="Resend">
                                                <RefreshCw class="h-3.5 w-3.5" />
                                            </button>
                                            <button class="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500" title="Delete">
                                                <Trash2 class="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="filteredLog.length === 0">
                                    <td colspan="5" class="py-8 text-center text-sm text-muted-foreground">No notifications found.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Scheduled Notifications -->
                    <div class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-black/5 dark:shadow-black/20">
                        <h2 class="mb-3 font-semibold text-foreground">Scheduled Notifications</h2>
                        <div class="space-y-3">
                            <div v-for="sn in localScheduled" :key="sn.id"
                                class="rounded-xl border border-border/50 p-4">
                                <div class="mb-1 flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <Calendar class="h-4 w-4 text-muted-foreground" />
                                        <span class="font-medium text-foreground text-sm">{{ sn.title }}</span>
                                    </div>
                                    <!-- ON/OFF toggle switch -->
                                    <button @click="toggleScheduled(sn.id)"
                                        class="relative h-5 w-9 rounded-full transition-colors"
                                        :class="sn.active ? 'bg-green-500' : 'bg-muted'">
                                        <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                                            :class="sn.active ? 'translate-x-4' : 'translate-x-0'" />
                                    </button>
                                </div>
                                <p class="mb-2 text-xs text-muted-foreground">
                                    <Clock class="inline h-3 w-3 mr-0.5" />
                                    {{ sn.schedule }} · Target: {{ sn.target }} · {{ sn.auto ? 'Auto' : 'Manual' }}
                                </p>
                                <div class="flex gap-2">
                                    <button class="rounded-lg border border-border/70 px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent">Edit</button>
                                </div>
                            </div>
                        </div>
                        <button class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent">
                            <Plus class="h-4 w-4" /> Create Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>

    <!-- Send Confirmation Modal -->
    <Teleport to="body">
        <div v-if="showConfirmSend" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="showConfirmSend = false"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B0000]/15">
                        <Send class="h-5 w-5 text-[#8B0000]" />
                    </div>
                    <h3 class="text-lg font-semibold text-foreground">Send Notification?</h3>
                </div>
                <p class="mb-6 text-sm text-muted-foreground">
                    This will send "<strong class="text-foreground">{{ form.title }}</strong>" to
                    <strong class="text-foreground">{{ form.targetRoute === 'all' ? 'All Routes' : form.targetRoute }}</strong>
                    ({{ form.audience === 'all' ? 'all users' : form.audience }}).
                </p>
                <div class="flex justify-end gap-3">
                    <button @click="showConfirmSend = false"
                        class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                        Cancel
                    </button>
                    <button @click="send"
                        class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000]">
                        Yes, Send
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Success Toast -->
    <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition ease-in duration-200" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
            <div v-if="showSuccess"
                class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
                <Check class="h-4 w-4" /> Notification sent successfully!
            </div>
        </Transition>
    </Teleport>
</template>
