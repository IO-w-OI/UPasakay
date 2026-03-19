<script setup lang="ts">
import { Head, Link, router, useForm } from '@inertiajs/vue3';
import {
    Mail, Key, Bus, ChevronLeft, Star, Edit, Trash2, Archive,
    AlertTriangle, Eye, EyeOff, RefreshCw, Shuffle,
} from 'lucide-vue-next';
import { ref, onBeforeUnmount } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const props = defineProps<{
    driver: {
        id: number; employee_id: string; full_name: string; license: string;
        status: string; route: string; shuttle: string; shuttle_id: number | null;
        email: string; last_login: string; total_sessions: number;
        total_pickups: number; avg_rating: string;
    };
    activityLog: Array<{ date: string; event: string; route: string; time: string }>;
    unassignedShuttles?: Array<{ id: number; shuttle_code: string }>;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home',    href: dashboard().url },
    { title: 'Drivers', href: '/drivers' },
    { title: props.driver.employee_id, href: `/drivers/${props.driver.id}` },
];

const activeTab = ref<'activity' | 'shuttles' | 'stats'>('activity');

// ── Edit drawer ───────────────────────────────────────────────────────────
const showEditDrawer = ref(false);
const editForm = useForm({
    full_name: props.driver.full_name,
    license_number: props.driver.license,
    email: props.driver.email,
    driver_status: props.driver.status,
});
const openEdit = () => {
    editForm.full_name = props.driver.full_name;
    editForm.license_number = props.driver.license;
    editForm.email = props.driver.email;
    editForm.driver_status = props.driver.status;
    showEditDrawer.value = true;
};
const submitEdit = () => {
    editForm.patch(`/drivers/${props.driver.id}`, {
        onSuccess: () => { showEditDrawer.value = false; },
    });
};

// ── Reset Password modal ─────────────────────────────────────────────────
const showResetPwModal = ref(false);
const showResetPw = ref(false);
const resetPwForm = useForm({ password: '' });
const generateResetPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pw = '';
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) pw += chars[arr[i] % chars.length];
    resetPwForm.password = pw;
    showResetPw.value = true;
};
const submitResetPassword = () => {
    if (resetPwForm.password.length < 8) return;
    resetPwForm.patch(`/drivers/${props.driver.id}/reset-password`, {
        onSuccess: () => { showResetPwModal.value = false; resetPwForm.reset(); showResetPw.value = false; },
    });
};

// ── Reassign Shuttle modal ────────────────────────────────────────────────
const showReassignModal = ref(false);
const reassignForm = useForm({ shuttle_id: props.driver.shuttle_id as number | null });
const openReassign = () => {
    reassignForm.shuttle_id = props.driver.shuttle_id;
    showReassignModal.value = true;
};
const submitReassign = () => {
    reassignForm.patch(`/drivers/${props.driver.id}`, {
        onSuccess: () => { showReassignModal.value = false; },
    });
};

// ── Deactivate / Archive ─────────────────────────────────────────────────
const showActionModal = ref(false);
const actionType = ref<'deactivate' | 'archive'>('deactivate');
const actionCountdown = ref(5);
let actionInterval: ReturnType<typeof setInterval> | null = null;

const startAction = (type: 'deactivate' | 'archive') => {
    actionType.value = type;
    actionCountdown.value = 5;
    showActionModal.value = true;
    actionInterval = setInterval(() => {
        actionCountdown.value--;
        if (actionCountdown.value <= 0 && actionInterval) {
            clearInterval(actionInterval); actionInterval = null;
        }
    }, 1000);
};
const confirmAction = () => {
    if (actionCountdown.value > 0) return;
    router.delete(`/drivers/${props.driver.id}`, {
        data: { action: actionType.value },
        preserveScroll: true,
    });
    cancelAction();
};
const cancelAction = () => {
    showActionModal.value = false;
    if (actionInterval) { clearInterval(actionInterval); actionInterval = null; }
};
onBeforeUnmount(() => { if (actionInterval) clearInterval(actionInterval); });

// ── Helpers ───────────────────────────────────────────────────────────────
const statusBadge = (s: string) => ({
    active: 'bg-green-500/15 text-green-600 dark:text-green-400',
    idle: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
    offline: 'bg-muted text-muted-foreground',
    suspended: 'bg-red-500/15 text-red-600 dark:text-red-400',
    inactive: 'bg-muted text-muted-foreground',
}[s] ?? 'bg-muted text-muted-foreground');

const statusColor = (s: string) => ({
    active: 'text-green-600 dark:text-green-400',
    idle: 'text-yellow-600 dark:text-yellow-400',
    offline: 'text-muted-foreground',
    suspended: 'text-red-600 dark:text-red-400',
    inactive: 'text-muted-foreground',
}[s] ?? 'text-muted-foreground');

const routeBadge = (r: string) => ({
    South: 'bg-green-500/15 text-green-600 dark:text-green-400',
    North: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'Cebu City': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
}[r] ?? 'bg-muted text-muted-foreground');
</script>

<template>
    <Head :title="`Driver — ${driver.full_name}`" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <Link href="/drivers" class="rounded-lg border border-border/70 p-1.5 text-muted-foreground hover:bg-accent">
                        <ChevronLeft class="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">{{ driver.full_name }}</h1>
                        <p class="text-xs text-muted-foreground">{{ driver.employee_id }}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="startAction('deactivate')"
                        class="flex items-center gap-1.5 rounded-xl border border-orange-500/30 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">
                        <Trash2 class="h-4 w-4" /> Deactivate
                    </button>
                    <button @click="startAction('archive')"
                        class="flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10">
                        <Archive class="h-4 w-4" /> Archive
                    </button>
                    <button @click="openEdit"
                        class="flex items-center gap-1.5 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000]">
                        <Edit class="h-4 w-4" /> Edit
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">

                <!-- Profile Card -->
                <div class="rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-black/5 dark:shadow-black/20 lg:col-span-4">
                    <!-- Avatar -->
                    <div class="mb-4 flex flex-col items-center gap-2">
                        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground">
                            {{ driver.full_name.charAt(0) }}
                        </div>
                        <h2 class="text-lg font-bold text-foreground">{{ driver.full_name }}</h2>
                        <p class="text-sm text-muted-foreground">Driver {{ driver.employee_id }}</p>
                    </div>

                    <div class="space-y-3 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground">Route</span>
                            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(driver.route)">
                                {{ driver.route }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground">Shuttle</span>
                            <span class="font-medium text-foreground">{{ driver.shuttle }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground">Status</span>
                            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusBadge(driver.status)">
                                {{ driver.status }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground">License</span>
                            <span class="font-medium text-foreground">{{ driver.license }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground">Email</span>
                            <span class="text-muted-foreground truncate max-w-36">{{ driver.email }}</span>
                        </div>
                    </div>

                    <hr class="my-4 border-border/50" />

                    <div class="space-y-1.5 text-sm">
                        <p class="text-muted-foreground">Last Login</p>
                        <p class="font-medium text-foreground">{{ driver.last_login }}</p>
                    </div>

                    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div class="rounded-xl bg-muted/50 p-3">
                            <p class="text-lg font-bold text-foreground">{{ driver.total_sessions }}</p>
                            <p class="text-[10px] text-muted-foreground">Sessions</p>
                        </div>
                        <div class="rounded-xl bg-muted/50 p-3">
                            <p class="text-lg font-bold text-foreground">{{ driver.total_pickups }}</p>
                            <p class="text-[10px] text-muted-foreground">Pickups</p>
                        </div>
                        <div class="rounded-xl bg-muted/50 p-3">
                            <p class="text-lg font-bold text-foreground">{{ driver.avg_rating }} <Star class="inline-block h-4 w-4 text-yellow-500" /></p>
                            <p class="text-[10px] text-muted-foreground">Avg Rating</p>
                        </div>
                    </div>

                    <div class="mt-5 space-y-2">
                        <button class="flex w-full items-center gap-2 rounded-xl border border-border/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                            <Mail class="h-4 w-4 text-muted-foreground" /> Send Message
                        </button>
                        <button @click="showResetPwModal = true; resetPwForm.password = ''; showResetPw = false"
                            class="flex w-full items-center gap-2 rounded-xl border border-border/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                            <Key class="h-4 w-4 text-muted-foreground" /> Reset Password
                        </button>
                        <button @click="openReassign"
                            class="flex w-full items-center gap-2 rounded-xl border border-border/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                            <Shuffle class="h-4 w-4 text-muted-foreground" /> Reassign Shuttle
                        </button>
                    </div>
                </div>

                <!-- Right panel -->
                <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20 lg:col-span-8">
                    <!-- Tabs -->
                    <div class="flex border-b border-border/50">
                        <button
                            v-for="tab in [{ key: 'activity', label: 'Activity Log' }, { key: 'shuttles', label: 'Assigned Shuttles' }, { key: 'stats', label: 'Stats' }]"
                            :key="tab.key"
                            @click="activeTab = tab.key as any"
                            class="px-5 py-3 text-sm font-medium transition"
                            :class="activeTab === tab.key
                                ? 'border-b-2 border-[#8B0000] text-[#8B0000]'
                                : 'text-muted-foreground hover:text-foreground'"
                        >
                            {{ tab.label }}
                        </button>
                    </div>

                    <!-- Activity Log Tab -->
                    <div v-if="activeTab === 'activity'" class="p-5">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-border/50 text-left text-xs font-medium uppercase text-muted-foreground">
                                    <th class="pb-2 pr-4">Date</th>
                                    <th class="pb-2 pr-4">Event</th>
                                    <th class="pb-2 pr-4">Time</th>
                                    <th class="pb-2">Route</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(log, i) in activityLog" :key="i"
                                    class="border-b border-border/30 last:border-0">
                                    <td class="py-2.5 pr-4 text-muted-foreground">{{ log.date }}</td>
                                    <td class="py-2.5 pr-4 text-foreground">{{ log.event }}</td>
                                    <td class="py-2.5 pr-4 text-muted-foreground">{{ log.time }}</td>
                                    <td class="py-2.5">
                                        <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="routeBadge(log.route)">
                                            {{ log.route }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="activityLog.length === 0">
                                    <td colspan="4" class="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Assigned Shuttles Tab -->
                    <div v-if="activeTab === 'shuttles'" class="p-5">
                        <div class="text-center py-10 text-sm text-muted-foreground">
                            Currently assigned to shuttle <span class="font-semibold text-foreground">{{ driver.shuttle }}</span>
                        </div>
                    </div>

                    <!-- Stats Tab -->
                    <div v-if="activeTab === 'stats'" class="grid grid-cols-2 gap-4 p-5">
                        <div class="rounded-xl bg-muted/50 p-4 text-center">
                            <p class="text-3xl font-bold text-foreground">{{ driver.total_pickups }}</p>
                            <p class="mt-1 text-sm text-muted-foreground">Total Pickups</p>
                        </div>
                        <div class="rounded-xl bg-muted/50 p-4 text-center">
                            <p class="text-3xl font-bold text-foreground">{{ driver.total_sessions }}</p>
                            <p class="mt-1 text-sm text-muted-foreground">Total Sessions</p>
                        </div>
                        <div class="rounded-xl bg-muted/50 p-4 text-center">
                            <p class="text-3xl font-bold text-foreground">{{ driver.avg_rating }} <Star class="inline-block h-5 w-5 text-yellow-500 ml-2" /></p>
                            <p class="mt-1 text-sm text-muted-foreground">Avg Rating</p>
                        </div>
                        <div class="rounded-xl bg-muted/50 p-4 text-center">
                            <p class="text-3xl font-bold capitalize" :class="statusColor(driver.status)">{{ driver.status }}</p>
                            <p class="mt-1 text-sm text-muted-foreground">Current Status</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>

    <!-- ═══ EDIT DRIVER DRAWER ═══ -->
    <Teleport to="body">
        <div v-if="showEditDrawer" class="fixed inset-0 z-50 flex">
            <div class="flex-1 bg-black/30" @click="showEditDrawer = false"></div>
            <div class="w-full max-w-md overflow-y-auto bg-card shadow-xl">
                <div class="flex items-center justify-between border-b border-border/70 px-6 py-4">
                    <h2 class="text-base font-semibold text-foreground">Edit Driver</h2>
                    <button @click="showEditDrawer = false" class="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
                </div>
                <form @submit.prevent="submitEdit" class="p-6 space-y-5">
                    <div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</p>
                        <div class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Full Name *</label>
                                <input v-model="editForm.full_name" type="text" required
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Email</label>
                                <input v-model="editForm.email" type="email"
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">License Number</label>
                                <input v-model="editForm.license_number" type="text"
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                            </div>
                        </div>
                    </div>
                    <hr class="border-border/50" />
                    <div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                        <select v-model="editForm.driver_status"
                            class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option value="active">Active (On Duty)</option>
                            <option value="idle">Idle (Logged in, no trip)</option>
                            <option value="offline">Offline</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <hr class="border-border/50" />
                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showEditDrawer = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="editForm.processing"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- ═══ RESET PASSWORD MODAL ═══ -->
    <Teleport to="body">
        <div v-if="showResetPwModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="showResetPwModal = false"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15">
                        <Key class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">Reset Password</h3>
                        <p class="text-xs text-muted-foreground">{{ driver.full_name }}</p>
                    </div>
                </div>
                <form @submit.prevent="submitResetPassword" class="space-y-4">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">New Password *</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <input v-model="resetPwForm.password" :type="showResetPw ? 'text' : 'password'" required
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                                <button type="button" @click="showResetPw = !showResetPw"
                                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <EyeOff v-if="showResetPw" class="h-4 w-4" />
                                    <Eye v-else class="h-4 w-4" />
                                </button>
                            </div>
                            <button type="button" @click="generateResetPassword"
                                class="flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent whitespace-nowrap">
                                <RefreshCw class="h-3.5 w-3.5" /> Generate
                            </button>
                        </div>
                        <p v-if="resetPwForm.password && resetPwForm.password.length < 8" class="mt-1 text-xs text-red-500">Min 8 characters</p>
                        <p v-if="resetPwForm.errors.password" class="mt-1 text-xs text-red-500">{{ resetPwForm.errors.password }}</p>
                    </div>
                    <hr class="border-border/50" />
                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showResetPwModal = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="resetPwForm.processing || resetPwForm.password.length < 8"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- ═══ REASSIGN SHUTTLE MODAL ═══ -->
    <Teleport to="body">
        <div v-if="showReassignModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="showReassignModal = false"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15">
                        <Shuffle class="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">Reassign Shuttle</h3>
                        <p class="text-xs text-muted-foreground">{{ driver.full_name }}</p>
                    </div>
                </div>
                <form @submit.prevent="submitReassign" class="space-y-4">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Select Shuttle</label>
                        <select v-model="reassignForm.shuttle_id"
                            class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option :value="null">— Unassigned —</option>
                            <option v-if="driver.shuttle_id" :value="driver.shuttle_id">{{ driver.shuttle }} (current)</option>
                            <option v-for="s in (unassignedShuttles ?? [])" :key="s.id" :value="s.id">{{ s.shuttle_code }}</option>
                        </select>
                    </div>
                    <hr class="border-border/50" />
                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showReassignModal = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="reassignForm.processing"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- ═══ DEACTIVATE / ARCHIVE MODAL ═══ -->
    <Teleport to="body">
        <div v-if="showActionModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="cancelAction"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full"
                        :class="actionType === 'archive' ? 'bg-red-500/15' : 'bg-orange-500/15'">
                        <Archive v-if="actionType === 'archive'" class="h-5 w-5 text-red-600 dark:text-red-400" />
                        <AlertTriangle v-else class="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-foreground">
                        {{ actionType === 'archive' ? 'Archive Driver?' : 'Deactivate Driver?' }}
                    </h3>
                </div>
                <p class="mb-6 text-sm text-muted-foreground">
                    <template v-if="actionType === 'archive'">
                        This will archive <strong class="text-foreground">{{ driver.full_name }}</strong>, unassign their shuttle, and mark them offline.
                    </template>
                    <template v-else>
                        Are you sure you want to deactivate <strong class="text-foreground">{{ driver.full_name }}</strong>? They will be marked offline.
                    </template>
                </p>
                <div class="flex justify-end gap-3">
                    <button @click="cancelAction"
                        class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                        Cancel
                    </button>
                    <button @click="confirmAction" :disabled="actionCountdown > 0"
                        class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        :class="actionType === 'archive' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'">
                        {{ actionCountdown > 0 ? `Yes (${actionCountdown}s)` : (actionType === 'archive' ? 'Yes, Archive' : 'Yes, Deactivate') }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
