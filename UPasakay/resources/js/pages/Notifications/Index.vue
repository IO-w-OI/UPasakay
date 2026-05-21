<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3';
import {
    AlertTriangle, Bell, Calendar, Check, Clock, Search,
    Send, Zap, RefreshCw, Trash2, Eye, Users, UserCheck,
    BarChart3, TrendingUp, Plus, Bus,
} from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',          href: dashboard().url },
    { title: 'Notifications', href: '/notifications' },
];

const props = defineProps<{
    routes: string[];
    notificationLog: Array<{ id: number; time: string; type: string; label: string; target: string; audience?: string; status: string; date: string; message?: string; title?: string; is_system?: boolean }>;
    scheduledNotifications: Array<{
        id: number; title: string; schedule: string; target: string; auto: boolean; active: boolean;
        name: string; notif_title: string; message: string; type: string;
        target_route: string; audience: string; frequency: string; time: string;
    }>;
}>();

// ── Smart Templates ────────────────────────────────────────────────────────
const templates = [
    { name: 'Delay Notice', type: 'delay', title: 'Route Delay Notice', message: 'Shuttle service on this route is currently delayed by approximately 15 minutes. We apologize for the inconvenience.' },
    { name: 'Shuttle Available', type: 'availability', title: 'Shuttle Now Available', message: 'A shuttle is now available on this route. Check the app for real-time location updates.' },
    { name: 'Service Suspended', type: 'announcement', title: 'Service Temporarily Suspended', message: 'Shuttle service has been temporarily suspended. We will notify you when service resumes.' },
    { name: 'Route Change', type: 'change', title: 'Route Change Notice', message: 'The route has been updated. Please check the app for the latest stops and schedule.' },
];

// ── Form ───────────────────────────────────────────────────────────────────
const form = ref({
    title: '',
    type: 'availability',
    targetRoute: 'all',
    audience: 'all' as 'all' | 'passengers' | 'drivers',
    message: '',
    delivery_type: 'now' as 'now' | 'scheduled',
    schedule_date: '',
    schedule_time: '',
});
const charCount = computed(() => form.value.message.length);
const charLimitClass = computed(() => charCount.value > 160 ? 'text-red-500' : 'text-muted-foreground');
const canSend = computed(() => form.value.title.trim() !== '' && form.value.message.trim() !== '');

// ── View Details Modal ────────────────────────────────────────────────────
const isViewModalOpen = ref(false);
const selectedLog = ref<null | any>(null);

const viewDetails = (log: any) => {
    selectedLog.value = log;
    isViewModalOpen.value = true;
};

const formatDateDisplay = (dateStr: string | Date): string => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') {
        const trimmed = dateStr.trim();
        if (trimmed === 'Today' || trimmed === 'Yesterday') return trimmed;
        const parsed = Date.parse(trimmed);
        if (!isNaN(parsed)) {
            const d = new Date(parsed);
            return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        return trimmed;
    } else {
        return dateStr.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
};

// ── Schedule Modal ─────────────────────────────────────────────────────────
type ScheduleRow = typeof props.scheduledNotifications[0];

const isScheduleModalOpen = ref(false);
const isEditingSchedule = ref(false);
const isSavingSchedule = ref(false);

const blankSchedule = () => ({
    name: '',
    frequency: 'daily' as 'daily' | 'weekdays' | 'weekends' | 'custom',
    time: '08:00',
    title: '',
    type: 'availability',
    message: '',
    targetRoute: 'all',
    audience: 'all' as 'all' | 'passengers' | 'drivers',
    active: true,
    days: [] as number[],
});
const scheduleForm = ref(blankSchedule());
const selectedSchedule = ref<null | ScheduleRow>(null);

const toggleDay = (dayIndex: number) => {
    if (scheduleForm.value.days.includes(dayIndex)) {
        scheduleForm.value.days = scheduleForm.value.days.filter(d => d !== dayIndex);
    } else {
        scheduleForm.value.days.push(dayIndex);
    }
};

const openScheduleModal = (schedule?: ScheduleRow) => {
    if (schedule) {
        isEditingSchedule.value = true;
        selectedSchedule.value = schedule;
        scheduleForm.value = {
            name: schedule.name,
            frequency: (schedule.frequency as any) || 'daily',
            time: schedule.time || '08:00',
            title: schedule.notif_title || '',
            type: schedule.type || 'availability',
            message: schedule.message || '',
            targetRoute: schedule.target_route || 'all',
            audience: (schedule.audience as any) || 'all',
            active: schedule.active,
            days: [],
        };
    } else {
        isEditingSchedule.value = false;
        selectedSchedule.value = null;
        scheduleForm.value = blankSchedule();
    }
    isScheduleModalOpen.value = true;
};

const closeScheduleModal = () => {
    isScheduleModalOpen.value = false;
    scheduleForm.value = blankSchedule();
};

const canSaveSchedule = computed(() =>
    scheduleForm.value.name.trim() !== '' &&
    scheduleForm.value.title.trim() !== '' &&
    scheduleForm.value.message.trim() !== ''
);

const submitSchedule = () => {
    if (!canSaveSchedule.value) return;
    isSavingSchedule.value = true;
    const payload = {
        name: scheduleForm.value.name,
        title: scheduleForm.value.title,
        message: scheduleForm.value.message,
        type: scheduleForm.value.type,
        target_route: scheduleForm.value.targetRoute,
        audience: scheduleForm.value.audience,
        frequency: scheduleForm.value.frequency,
        time: scheduleForm.value.time,
        is_active: scheduleForm.value.active,
    };
    const opts = {
        preserveScroll: true,
        onSuccess: () => { isSavingSchedule.value = false; closeScheduleModal(); },
        onError: () => { isSavingSchedule.value = false; },
    };
    if (isEditingSchedule.value && selectedSchedule.value) {
        router.patch(`/notifications/schedules/${selectedSchedule.value.id}`, payload, opts);
    } else {
        router.post('/notifications/schedules', payload, opts);
    }
};

const deleteSchedule = () => {
    if (!selectedSchedule.value) return;
    router.delete(`/notifications/schedules/${selectedSchedule.value.id}`, {
        preserveScroll: true,
        onSuccess: () => closeScheduleModal(),
    });
};

// ── Delete Confirmation ────────────────────────────────────────────────────
const showDeleteConfirm = ref(false);
const deletingItemIndex = ref<number | null>(null);

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

const resetForm = () => {
    form.value = {
        title: '',
        type: 'availability',
        targetRoute: 'all',
        audience: 'all',
        message: '',
        delivery_type: 'now',
        schedule_date: '',
        schedule_time: '',
    };
};

const send = () => {
    showConfirmSend.value = false;
    isSending.value = true;
    router.post('/notifications', {
        title: form.value.title,
        type: form.value.type,
        target_route: form.value.targetRoute,
        audience: form.value.audience,
        message: form.value.message,
        delivery_type: form.value.delivery_type,
        schedule_date: form.value.schedule_date || undefined,
        schedule_time: form.value.schedule_time || undefined,
    }, {
        onSuccess: () => {
            isSending.value = false;
            showSuccess.value = true;
            resetForm();
            setTimeout(() => { showSuccess.value = false; }, 3000);
        },
        onError: () => {
            isSending.value = false;
        },
    });
};

const resendNotification = (log: any) => {
    form.value.title = log.title || log.label;
    form.value.message = log.message || '';
    form.value.type = ['availability', 'delay', 'change', 'announcement'].includes(log.type)
        ? log.type
        : 'announcement';
    form.value.targetRoute = log.target === 'All Routes' ? 'all' : log.target;
    form.value.audience = log.audience || 'all';
    form.value.delivery_type = 'now';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const confirmDelete = (index: number) => {
    deletingItemIndex.value = index;
    showDeleteConfirm.value = true;
};

const deleteNotification = () => {
    if (deletingItemIndex.value !== null) {
        const notificationToDelete = filteredLog.value[deletingItemIndex.value];
        if (notificationToDelete?.id) {
            router.delete(`/notifications/${notificationToDelete.id}`);
        }
    }
    showDeleteConfirm.value = false;
    deletingItemIndex.value = null;
};

// ── Log ────────────────────────────────────────────────────────────────────
const logSearch = ref('');
const typeFilter = ref('All');
const statusFilter = ref('All');

const filteredLog = computed(() =>
    props.notificationLog.filter(n => {
        const typeMatch = typeFilter.value === 'All' || n.type === typeFilter.value;
        const statusMatch = statusFilter.value === 'All' || n.status === statusFilter.value;
        const q = logSearch.value.toLowerCase();
        const searchMatch = !q ||
            (n.title ?? '').toLowerCase().includes(q) ||
            (n.message ?? '').toLowerCase().includes(q) ||
            n.label.toLowerCase().includes(q) ||
            n.target.toLowerCase().includes(q);
        return typeMatch && statusMatch && searchMatch;
    })
);

const typeIconComponent = (t: string) =>
    ({ schedule: Calendar, delay: Clock, change: AlertTriangle }[t] ?? Bell);

const typeBadgeClass = (t: string) =>
    ({ schedule: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', delay: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', change: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' }[t] ?? 'bg-muted text-muted-foreground');

// ── Scheduled ──────────────────────────────────────────────────────────────
// Persist the on/off switch immediately; Inertia refreshes the prop on success.
const toggleScheduled = (id: number) => {
    router.patch(`/notifications/schedules/${id}/toggle`, {}, { preserveScroll: true });
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
                            <option value="availability">Shuttle Availability</option>
                            <option value="delay">Route Delay</option>
                            <option value="change">Route Change</option>
                            <option value="announcement">Service Announcement</option>
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

                    <!-- Delivery Option -->
                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-foreground">Delivery *</label>
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" v-model="form.delivery_type" value="now" class="text-[#8B0000] focus:ring-[#8B0000]">
                                <span class="text-sm">Send Now</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" v-model="form.delivery_type" value="scheduled" class="text-[#8B0000] focus:ring-[#8B0000]">
                                <span class="text-sm">Schedule for Later</span>
                            </label>
                        </div>

                        <div v-if="form.delivery_type === 'scheduled'" class="flex gap-3 mt-3">
                            <div class="flex-1">
                                <label class="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
                                <input type="date" v-model="form.schedule_date" class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            </div>
                            <div class="flex-1">
                                <label class="mb-1 block text-xs font-medium text-muted-foreground">Time</label>
                                <input type="time" v-model="form.schedule_time" class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Preview -->
                    <div>
                        <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Mobile Preview</label>
                        <div class="mx-auto w-80 space-y-3">
                            <!-- iOS-style notification -->
                            <div class="rounded-2xl border border-border/70 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-3 shadow-xl">
                                <div class="rounded-xl bg-white dark:bg-slate-800 p-3 shadow-lg">
                                    <div class="flex items-center gap-2 mb-2">
                                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-[#8B0000] flex-shrink-0">
                                            <Bell class="h-4 w-4 text-white" />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-[11px] font-semibold text-slate-900 dark:text-white">UPasakay</p>
                                            <p class="text-[10px] text-slate-500 dark:text-slate-400">just now</p>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{{ preview.title || 'Your notification title' }}</p>
                                        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{{ preview.body || 'Your notification preview will appear here.' }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Android-style notification -->
                            <div class="rounded-lg border border-border/70 bg-white dark:bg-slate-900 p-4 shadow-lg">
                                <div class="flex gap-3">
                                    <div class="flex h-10 w-10 items-center justify-center rounded bg-[#8B0000] flex-shrink-0">
                                        <Bell class="h-5 w-5 text-white" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1 mb-0.5">
                                            <p class="text-sm font-semibold text-foreground">UPasakay</p>
                                            <p class="text-xs text-muted-foreground">now</p>
                                        </div>
                                        <p class="text-sm text-foreground font-medium leading-snug">{{ preview.title || 'Your notification title' }}</p>
                                        <p class="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">{{ preview.body || 'Your notification preview will appear here.' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end gap-3 pt-2">
                        <button @click="resetForm"
                            class="rounded-xl border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Clear
                        </button>
                        <button @click="openSendConfirm" :disabled="!canSend || isSending"
                            class="flex items-center gap-2 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            <Send v-if="!isSending" class="h-4 w-4" />
                            <RefreshCw v-else class="h-4 w-4 animate-spin" />
                            {{ isSending ? 'Sending...' : (form.delivery_type === 'now' ? 'Send Now' : 'Schedule Notification') }}
                        </button>
                    </div>
                </div>

                <!-- Right column -->
                <div class="space-y-5">
                    <!-- Notification Log -->
                    <div class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-black/5 dark:shadow-black/20">
                        <h2 class="mb-3 font-semibold text-foreground">Notification Log</h2>
                        <div class="mb-3 flex flex-col sm:flex-row gap-2">
                            <div class="flex flex-1 items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
                                <Search class="h-4 w-4 text-muted-foreground shrink-0" />
                                <input v-model="logSearch" placeholder="Search…"
                                    class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                            </div>
                            <select v-model="typeFilter"
                                class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                                <option value="All">All Types</option>
                                <option value="availability">Shuttle Availability</option>
                                <option value="delay">Route Delay</option>
                                <option value="change">Route Change</option>
                                <option value="announcement">Service Announcement</option>
                            </select>
                            <select v-model="statusFilter"
                                class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                                <option value="All">All Status</option>
                                <option value="sent">Sent</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div class="overflow-auto max-h-115 rounded-lg">
                            <table class="w-full text-sm">
                                <thead class="sticky top-0 bg-card z-10">
                                    <tr class="text-left text-xs font-medium uppercase text-muted-foreground border-b border-border/50">
                                        <th class="pb-2 pr-3">Date/Time</th>
                                        <th class="pb-2 pr-3">Title & Message</th>
                                        <th class="pb-2 pr-3">Type & Target</th>
                                        <th class="pb-2 pr-3">Status</th>
                                        <th class="pb-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(n, i) in filteredLog" :key="i"
                                        class="border-b border-border/30 last:border-0">
                                        <td class="py-3 pr-3 text-muted-foreground text-xs whitespace-nowrap">
                                            <div class="font-medium">{{ n.time }}</div>
                                            <div class="text-muted-foreground/70">{{ n.date }}</div>
                                        </td>
                                        <td class="py-3 pr-3">
                                            <div class="flex items-center gap-1.5">
                                                <span class="font-medium text-foreground text-sm line-clamp-1">{{ n.title || n.label }}</span>
                                                <span v-if="n.is_system" class="inline-flex items-center rounded-full bg-slate-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                                    System
                                                </span>
                                            </div>
                                            <div class="text-xs text-muted-foreground line-clamp-1">{{ n.message || '—' }}</div>
                                        </td>
                                        <td class="py-3 pr-3">
                                            <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" :class="typeBadgeClass(n.type)">
                                                <component :is="typeIconComponent(n.type)" class="h-3 w-3" />
                                                {{ n.label }}
                                            </span>
                                            <div class="mt-1 text-xs text-muted-foreground">{{ n.target }}</div>
                                        </td>
                                        <td class="py-3 pr-3">
                                            <span v-if="n.status === 'sent'" class="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                                <Check class="h-3 w-3" />Sent
                                            </span>
                                            <span v-else-if="n.status === 'scheduled'" class="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                <Clock class="h-3 w-3" />Scheduled
                                            </span>
                                            <span v-else class="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                <AlertTriangle class="h-3 w-3" />Failed
                                            </span>
                                        </td>
                                        <td class="py-3">
                                            <div class="flex items-center gap-1">
                                                <button @click="viewDetails(n)" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="View Details">
                                                    <Eye class="h-3.5 w-3.5" />
                                                </button>
                                                <button @click="resendNotification(n)" class="rounded p-1 text-muted-foreground hover:bg-blue-500/20 hover:text-blue-500 transition-colors" title="Resend" v-if="n.status !== 'scheduled'">
                                                    <RefreshCw class="h-3.5 w-3.5" />
                                                </button>
                                                <button @click="confirmDelete(i)" class="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete">
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
                    </div>

                    <!-- Scheduled Notifications -->
                    <div class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-black/5 dark:shadow-black/20">
                        <h2 class="mb-3 font-semibold text-foreground">Scheduled Notifications</h2>
                        <div class="space-y-3">
                            <div v-for="sn in props.scheduledNotifications" :key="sn.id"
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
                                    {{ sn.schedule }} · Target: {{ sn.target }} · {{ sn.active ? 'Active' : 'Paused' }}
                                </p>
                                <div class="flex gap-2">
                                    <button @click="openScheduleModal(sn)" class="rounded-lg border border-border/70 px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors">Edit</button>
                                </div>
                            </div>
                            <p v-if="props.scheduledNotifications.length === 0" class="py-4 text-center text-xs text-muted-foreground">
                                No recurring schedules yet.
                            </p>
                        </div>
                        <button @click="openScheduleModal()" class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
                            <Plus class="h-4 w-4" /> Create Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>>

    <!-- View Details Modal -->
    <Teleport to="body">
        <div v-if="isViewModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-neutral-950/70 dark:bg-black/85 backdrop-blur-sm transition-opacity" @click="isViewModalOpen = false"></div>
            
            <div v-if="selectedLog" class="relative w-full max-w-lg transform overflow-hidden rounded-xl border bg-card p-6 shadow-2xl transition-all z-10">
                <button @click="isViewModalOpen = false" class="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <span class="text-2xl">×</span>
                </button>
                
                <div class="flex items-center gap-2 border-b pb-3 pr-8">
                    <h3 class="text-lg font-semibold">{{ selectedLog.title || selectedLog.label }}</h3>
                    <span v-if="selectedLog.is_system" class="inline-flex items-center rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        System
                    </span>
                </div>

                <p v-if="selectedLog.is_system" class="mt-3 text-xs text-muted-foreground">
                    This is an automated alert generated by the system, not an admin broadcast.
                </p>

                <div class="space-y-4 mt-4 text-sm">
                    <div>
                        <span class="text-muted-foreground block mb-1 text-xs font-medium">Message</span>
                        <p class="p-3 bg-muted rounded-lg text-foreground whitespace-pre-line">{{ selectedLog.message || 'No message content.' }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="text-muted-foreground block mb-1 text-xs font-medium">Target</span>
                            <span class="font-medium">{{ selectedLog.target }}</span>
                        </div>
                        <div>
                            <span class="text-muted-foreground block mb-1 text-xs font-medium">Type</span>
                            <span class="font-medium">{{ selectedLog.label }}</span>
                        </div>
                        <div>
                            <span class="text-muted-foreground block mb-1 text-xs font-medium">Date</span>
                            <span class="font-medium">{{ selectedLog.date }}</span>
                        </div>
                        <div>
                            <span class="text-muted-foreground block mb-1 text-xs font-medium">Time</span>
                            <span class="font-medium">{{ selectedLog.time }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-muted-foreground block mb-1 text-xs font-medium">Status</span>
                            <span v-if="selectedLog.status === 'sent'" class="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                <Check class="h-3 w-3" />Sent
                            </span>
                            <span v-else-if="selectedLog.status === 'scheduled'" class="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <Clock class="h-3 w-3" />Scheduled
                            </span>
                            <span v-else class="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                                <AlertTriangle class="h-3 w-3" />Failed
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                    <button @click="isViewModalOpen = false" class="rounded-lg border border-border/70 px-4 py-2 hover:bg-accent text-sm font-medium">Close</button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Send Confirmation Modal -->
    <Teleport to="body">
        <div v-if="showConfirmSend" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-neutral-950/70 dark:bg-black/85 backdrop-blur-sm transition-opacity" @click="showConfirmSend = false"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl z-10">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B0000]/15">
                        <Send class="h-5 w-5 text-[#8B0000]" />
                    </div>
                    <h3 class="text-lg font-semibold text-foreground">{{ form.delivery_type === 'now' ? 'Send Notification?' : 'Schedule Notification?' }}</h3>
                </div>
                <p class="mb-6 text-sm text-muted-foreground">
                    This will {{ form.delivery_type === 'now' ? 'send immediately' : `schedule for ${form.schedule_date} at ${form.schedule_time}` }} "<strong class="text-foreground">{{ form.title }}</strong>" to
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
                        {{ form.delivery_type === 'now' ? 'Yes, Send' : 'Yes, Schedule' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-neutral-950/70 dark:bg-black/85 backdrop-blur-sm transition-opacity" @click="showDeleteConfirm = false"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl z-10">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                        <Trash2 class="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-foreground">Delete Notification?</h3>
                </div>
                <p class="mb-6 text-sm text-muted-foreground">
                    This action cannot be undone. The notification will be permanently deleted from the log.
                </p>
                <div class="flex justify-end gap-3">
                    <button @click="showDeleteConfirm = false"
                        class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                        Cancel
                    </button>
                    <button @click="deleteNotification"
                        class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Schedule Modal Drawer -->
    <Teleport to="body">
        <div v-if="isScheduleModalOpen" class="fixed inset-0 z-[100]">
            <div class="fixed inset-0 bg-neutral-950/70 dark:bg-black/85 backdrop-blur-sm transition-opacity" @click="closeScheduleModal"></div>
            <div class="fixed inset-0 pointer-events-none">
                <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                            leave-active-class="transition ease-in duration-200" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
                    <div v-if="isScheduleModalOpen" class="pointer-events-auto absolute inset-0 flex justify-end">
                        <div class="relative ml-auto w-full max-w-md rounded-l-2xl bg-card shadow-2xl overflow-y-auto z-[110]">
                    <div class="sticky top-0 bg-card border-b border-border/50 p-6 flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-foreground">{{ isEditingSchedule ? 'Edit Schedule' : 'Create Schedule' }}</h2>
                        <button @click="closeScheduleModal" class="text-muted-foreground hover:text-foreground">
                            <span class="text-2xl">×</span>
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <!-- Schedule Name -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-foreground">Schedule Name *</label>
                            <input v-model="scheduleForm.name" type="text" placeholder="e.g. Morning Peak Hour"
                                class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000] placeholder:text-muted-foreground" />
                        </div>

                        <!-- Frequency -->
                        <div>
                            <label class="mb-2 block text-sm font-medium text-foreground">Repeat</label>
                            <select v-model="scheduleForm.frequency"
                                class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                                <option value="daily">Daily</option>
                                <option value="weekdays">Weekdays</option>
                                <option value="weekends">Weekends</option>
                                <option value="custom">Custom Days</option>
                            </select>
                        </div>

                        <!-- Custom Days Selector -->
                        <div v-if="scheduleForm.frequency === 'custom'" class="space-y-2">
                            <label class="block text-xs text-muted-foreground font-medium">Select Days *</label>
                            <div class="flex justify-between gap-1">
                                <button 
                                    v-for="(day, index) in ['M','T','W','T','F','S','S']" 
                                    :key="index"
                                    type="button"
                                    @click="toggleDay(index)"
                                    :class="scheduleForm.days.includes(index) 
                                        ? 'bg-[#8B0000] text-white border-[#8B0000]' 
                                        : 'bg-muted text-muted-foreground border-border/70 hover:bg-accent'"
                                    class="w-10 h-10 rounded-full border text-sm font-semibold transition-colors flex items-center justify-center">
                                    {{ day }}
                                </button>
                            </div>
                        </div>

                        <!-- Time -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-foreground">Time *</label>
                            <input v-model="scheduleForm.time" type="time"
                                class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                        </div>

                        <div class="border-t border-border/50 pt-4">
                            <h3 class="text-sm font-medium text-foreground mb-4">Notification Content</h3>

                            <!-- Title -->
                            <div class="mb-4">
                                <label class="mb-1 block text-sm font-medium text-foreground">Title *</label>
                                <input v-model="scheduleForm.title" type="text" placeholder="Notification title…"
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000] placeholder:text-muted-foreground" />
                            </div>

                            <!-- Type -->
                            <div class="mb-4">
                                <label class="mb-2 block text-sm font-medium text-foreground">Type *</label>
                                <select v-model="scheduleForm.type"
                                    class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                                    <option value="availability">Shuttle Availability</option>
                                    <option value="delay">Route Delay</option>
                                    <option value="change">Route Change</option>
                                    <option value="announcement">Service Announcement</option>
                                </select>
                            </div>

                            <!-- Message -->
                            <div class="mb-4">
                                <label class="mb-1 block text-sm font-medium text-foreground">Message *</label>
                                <textarea v-model="scheduleForm.message" rows="3" maxlength="160"
                                    placeholder="Notification message…"
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000] resize-none placeholder:text-muted-foreground"></textarea>
                            </div>

                            <!-- Target Route -->
                            <div class="mb-4">
                                <label class="mb-2 block text-sm font-medium text-foreground">Target Route *</label>
                                <div class="flex flex-wrap gap-2">
                                    <button v-for="opt in [{ val: 'all', label: 'All Routes' }, ...props.routes.map(r => ({ val: r, label: r }))]"
                                        :key="opt.val"
                                        @click="scheduleForm.targetRoute = opt.val"
                                        class="rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors"
                                        :class="scheduleForm.targetRoute === opt.val
                                            ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] dark:text-red-300'
                                            : 'border-border/70 text-muted-foreground hover:bg-accent'">
                                        {{ opt.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Audience -->
                            <div class="mb-4">
                                <label class="mb-2 block text-sm font-medium text-foreground">Audience</label>
                                <div class="flex flex-wrap gap-2">
                                    <button v-for="a in audienceOptions" :key="a.val"
                                        @click="scheduleForm.audience = a.val"
                                        class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors"
                                        :class="scheduleForm.audience === a.val
                                            ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] dark:text-red-300'
                                            : 'border-border/70 text-muted-foreground hover:bg-accent'">
                                        <component :is="a.icon" class="h-3.5 w-3.5" />
                                        {{ a.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Active Toggle -->
                            <div class="pt-4 border-t border-border/50">
                                <label class="flex items-center gap-3 cursor-pointer">
                                    <button @click="scheduleForm.active = !scheduleForm.active"
                                        class="relative h-5 w-9 rounded-full transition-colors"
                                        :class="scheduleForm.active ? 'bg-green-500' : 'bg-muted'">
                                        <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                                            :class="scheduleForm.active ? 'translate-x-4' : 'translate-x-0'" />
                                    </button>
                                    <span class="text-sm font-medium text-foreground">Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="sticky bottom-0 bg-card border-t border-border/50 p-6 flex gap-3">
                        <button v-if="isEditingSchedule" @click="deleteSchedule"
                            class="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10">
                            Delete
                        </button>
                        <button @click="closeScheduleModal"
                            class="flex-1 rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button @click="submitSchedule" :disabled="!canSaveSchedule || isSavingSchedule"
                            class="flex-1 rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            {{ isSavingSchedule ? 'Saving…' : (isEditingSchedule ? 'Update' : 'Create') }}
                        </button>
                    </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </Teleport>

    <!-- Success Toast -->
    <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition ease-in duration-200" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
            <div v-if="showSuccess"
                class="fixed bottom-6 right-6 z-[110] flex items-center gap-2.5 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
                <Check class="h-4 w-4" /> Notification sent successfully!
            </div>
        </Transition>
    </Teleport>
</template>
