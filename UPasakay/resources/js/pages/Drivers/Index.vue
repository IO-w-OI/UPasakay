<script setup lang="ts">
import { Head, Link, router, useForm } from '@inertiajs/vue3';
import {
    Search, Download, UserPlus, Eye, EyeOff, Edit, MoreHorizontal,
    Trash2, Key, Bus, AlertTriangle, Archive, Wrench, UserMinus,
    UserCheck, RefreshCw, Shuffle, CircleDot,
} from 'lucide-vue-next';
import { ref, computed, onBeforeUnmount } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Drivers & Shuttles', href: '/drivers' },
];

interface DriverItem {
    id: number; employee_id: string; full_name: string; email: string;
    license_number: string; status: string; route: string; route_id: number | null;
    shuttle: string; shuttle_id: number | null; last_active: string;
    is_online: boolean; total_pickups: number;
}
interface ShuttleItem {
    id: number; shuttle_code: string; shuttle_type: string; plate_number: string;
    capacity: number; status: string; route: string; route_id: number | null;
    driver: string; driver_id: number | null; is_active: boolean;
}

const props = defineProps<{
    drivers: {
        data: DriverItem[];
        current_page: number; last_page: number; total: number; per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    shuttles: ShuttleItem[];
    unassignedShuttles: Array<{ id: number; shuttle_code: string }>;
    allDrivers: Array<{ id: number; full_name: string }>;
    routes: string[];
    filters: { search?: string; status?: string; route?: string };
}>();

// ── Filters ────────────────────────────────────────────────────────────────
const search       = ref(props.filters.search ?? '');
const statusFilter = ref(props.filters.status ?? 'All');
const routeFilter  = ref(props.filters.route  ?? 'All');

const applyFilters = () => {
    router.get('/drivers', {
        search: search.value || undefined,
        status: statusFilter.value !== 'All' ? statusFilter.value : undefined,
        route:  routeFilter.value  !== 'All' ? routeFilter.value  : undefined,
    }, { preserveState: true, replace: true });
};

// ── Select all ────────────────────────────────────────────────────────────
const selected = ref<number[]>([]);
const allSelected = computed(() => selected.value.length === props.drivers.data.length && props.drivers.data.length > 0);
const toggleAll = () => { selected.value = allSelected.value ? [] : props.drivers.data.map(d => d.id); };
const toggleOne = (id: number) => {
    selected.value = selected.value.includes(id)
        ? selected.value.filter(i => i !== id) : [...selected.value, id];
};

// ── Create drawer ─────────────────────────────────────────────────────────
const showCreateDrawer = ref(false);
const showPassword = ref(false);
const form = useForm({
    full_name: '', license_number: '', email: '',
    password: '', route_id: '', shuttle_id: '' as string | number,
    send_credentials: false,
});
const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pw = '';
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) pw += chars[arr[i] % chars.length];
    form.password = pw;
    showPassword.value = true;
};
const createFormValid = computed(() =>
    form.full_name.trim() !== '' && form.license_number.trim() !== '' &&
    form.email.trim() !== '' && form.password.length >= 8
);
const submitCreate = () => {
    form.post('/drivers', {
        onSuccess: () => { showCreateDrawer.value = false; form.reset(); showPassword.value = false; },
    });
};

// ── Edit drawer ───────────────────────────────────────────────────────────
const showEditDrawer = ref(false);
const editingDriverId = ref<number | null>(null);
const editForm = useForm({
    full_name: '', license_number: '', email: '',
    driver_status: 'active' as string,
    shuttle_id: null as number | null,
});

const openEdit = (d: DriverItem) => {
    editingDriverId.value = d.id;
    editForm.full_name = d.full_name;
    editForm.license_number = d.license_number;
    editForm.email = d.email;
    editForm.driver_status = d.status;
    editForm.shuttle_id = d.shuttle_id;
    showEditDrawer.value = true;
    openMenu.value = null;
};
const editShuttleOptions = computed(() => {
    // Show unassigned shuttles + the shuttle currently assigned to this driver
    const currentShuttleId = editForm.shuttle_id;
    const current = props.shuttles.find(s => s.id === currentShuttleId);
    const opts: Array<{ id: number; shuttle_code: string }> = [...props.unassignedShuttles];
    if (current && !opts.find(o => o.id === current.id)) {
        opts.unshift({ id: current.id, shuttle_code: current.shuttle_code });
    }
    return opts;
});
const submitEdit = () => {
    if (!editingDriverId.value) return;
    editForm.patch(`/drivers/${editingDriverId.value}`, {
        onSuccess: () => { showEditDrawer.value = false; editForm.reset(); editingDriverId.value = null; },
    });
};

// ── Delete / Deactivate / Archive ─────────────────────────────────────────
const showDeleteModal = ref(false);
const deletingDriver = ref<DriverItem | null>(null);
const deleteAction = ref<'deactivate' | 'archive'>('deactivate');
const deleteCountdown = ref(5);
let deleteInterval: ReturnType<typeof setInterval> | null = null;

const startDelete = (d: DriverItem, action: 'deactivate' | 'archive' = 'deactivate') => {
    deletingDriver.value = d;
    deleteAction.value = action;
    deleteCountdown.value = 5;
    showDeleteModal.value = true;
    openMenu.value = null;
    deleteInterval = setInterval(() => {
        deleteCountdown.value--;
        if (deleteCountdown.value <= 0 && deleteInterval) {
            clearInterval(deleteInterval); deleteInterval = null;
        }
    }, 1000);
};
const confirmDelete = () => {
    if (!deletingDriver.value || deleteCountdown.value > 0) return;
    router.delete(`/drivers/${deletingDriver.value.id}`, {
        data: { action: deleteAction.value },
        preserveScroll: true,
    });
    cancelDelete();
};
const cancelDelete = () => {
    showDeleteModal.value = false;
    deletingDriver.value = null;
    if (deleteInterval) { clearInterval(deleteInterval); deleteInterval = null; }
};
onBeforeUnmount(() => { if (deleteInterval) clearInterval(deleteInterval); });

// ── Reset Password ────────────────────────────────────────────────────────
const showResetPwModal = ref(false);
const resetPwDriver = ref<DriverItem | null>(null);
const showResetPw = ref(false);
const resetPwForm = useForm({ password: '' });
const openResetPassword = (d: DriverItem) => {
    resetPwDriver.value = d;
    resetPwForm.password = '';
    showResetPw.value = false;
    showResetPwModal.value = true;
    openMenu.value = null;
};
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
    if (!resetPwDriver.value || resetPwForm.password.length < 8) return;
    resetPwForm.patch(`/drivers/${resetPwDriver.value.id}/reset-password`, {
        onSuccess: () => { showResetPwModal.value = false; resetPwDriver.value = null; resetPwForm.reset(); },
    });
};

// ── Driver overflow menu ──────────────────────────────────────────────────
const openMenu = ref<number | null>(null);
const toggleMenu = (id: number) => { openMenu.value = openMenu.value === id ? null : id; };

// ── Shuttle filters ───────────────────────────────────────────────────────
const shuttleSearch       = ref('');
const shuttleRouteFilter  = ref('All');
const shuttleStatusFilter = ref('All');
const shuttleTypeFilter   = ref('All');

const filteredShuttles = computed(() => {
    return props.shuttles.filter(s => {
        if (shuttleRouteFilter.value !== 'All' && s.route !== shuttleRouteFilter.value) return false;
        if (shuttleStatusFilter.value !== 'All' && s.status !== shuttleStatusFilter.value) return false;
        if (shuttleTypeFilter.value !== 'All' && s.shuttle_type !== shuttleTypeFilter.value) return false;
        if (shuttleSearch.value) {
            const q = shuttleSearch.value.toLowerCase();
            if (!(s.shuttle_code.toLowerCase().includes(q) ||
                  s.plate_number.toLowerCase().includes(q) ||
                  s.driver.toLowerCase().includes(q) ||
                  s.route.toLowerCase().includes(q))) return false;
        }
        return true;
    });
});

// ── Shuttle actions ───────────────────────────────────────────────────────
const shuttleMenu = ref<number | null>(null);
const toggleShuttleMenu = (id: number) => { shuttleMenu.value = shuttleMenu.value === id ? null : id; };

const showShuttleEditModal = ref(false);
const editingShuttle = ref<ShuttleItem | null>(null);
const shuttleEditForm = useForm({
    shuttle_type: 'van' as string,
    plate_number: '',
    capacity: 0,
    status: 'active' as string,
});
const openShuttleEdit = (s: ShuttleItem) => {
    editingShuttle.value = s;
    shuttleEditForm.shuttle_type = s.shuttle_type;
    shuttleEditForm.plate_number = s.plate_number;
    shuttleEditForm.capacity = s.capacity;
    shuttleEditForm.status = s.status;
    showShuttleEditModal.value = true;
    shuttleMenu.value = null;
};
const submitShuttleEdit = () => {
    if (!editingShuttle.value) return;
    shuttleEditForm.patch(`/shuttles/${editingShuttle.value.id}`, {
        onSuccess: () => { showShuttleEditModal.value = false; editingShuttle.value = null; },
    });
};

// Shuttle assign driver
const showAssignDriverModal = ref(false);
const assigningShuttle = ref<ShuttleItem | null>(null);
const assignDriverForm = useForm({ driver_id: null as number | null });
const openAssignDriver = (s: ShuttleItem) => {
    assigningShuttle.value = s;
    assignDriverForm.driver_id = s.driver_id;
    showAssignDriverModal.value = true;
    shuttleMenu.value = null;
};
const submitAssignDriver = () => {
    if (!assigningShuttle.value) return;
    assignDriverForm.patch(`/shuttles/${assigningShuttle.value.id}/assign-driver`, {
        onSuccess: () => { showAssignDriverModal.value = false; assigningShuttle.value = null; },
    });
};

// Quick shuttle status change
const setShuttleStatus = (s: ShuttleItem, status: string) => {
    router.patch(`/shuttles/${s.id}/status`, { status }, { preserveScroll: true });
    shuttleMenu.value = null;
};

// ── Helpers ───────────────────────────────────────────────────────────────
const statusDot = (s: string) => ({
    active: 'bg-green-500', idle: 'bg-yellow-400', offline: 'bg-gray-400', suspended: 'bg-red-500',
}[s] ?? 'bg-gray-400');

const statusBadge = (s: string) => ({
    active: 'bg-green-500/15 text-green-600 dark:text-green-400',
    idle: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
    offline: 'bg-muted text-muted-foreground',
    suspended: 'bg-red-500/15 text-red-600 dark:text-red-400',
}[s] ?? 'bg-muted text-muted-foreground');

const routeBadge = (r: string) => ({
    South: 'bg-green-500/15 text-green-600 dark:text-green-400',
    North: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'Cebu City': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
}[r] ?? 'bg-muted text-muted-foreground');

const shuttleStatusBadge = (s: string) => ({
    active: 'bg-green-500/15 text-green-600 dark:text-green-400',
    idle: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
    offline: 'bg-muted text-muted-foreground',
    maintenance: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
}[s] ?? 'bg-muted text-muted-foreground');

const shuttleStatusDot = (s: string) => ({
    active: 'bg-green-500', idle: 'bg-yellow-400', offline: 'bg-gray-400', maintenance: 'bg-orange-400',
}[s] ?? 'bg-gray-400');

const typeLabel = (t: string) => ({ van: 'Van', minibus: 'Minibus', bus: 'Bus' }[t] ?? t);

const typeBadge = (t: string) => ({
    van: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    minibus: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    bus: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
}[t] ?? 'bg-muted text-muted-foreground');

const lastActiveClass = (d: DriverItem) => d.is_online ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground';
</script>

<template>
    <Head title="Drivers & Shuttles" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-8 p-6">

            <!-- ═══════════════════════════════════════════
                 DRIVER MANAGEMENT
                 ═══════════════════════════════════════════ -->
            <section class="space-y-5">
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-foreground">Driver Management</h1>
                    <button @click="showCreateDrawer = true"
                        class="flex items-center gap-2 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#700000]">
                        <UserPlus class="h-4 w-4" /> Create New Driver
                    </button>
                </div>

                <!-- Filter bar -->
                <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="flex flex-1 items-center gap-2 rounded-lg border border-border/70 px-3 py-2 min-w-52">
                        <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input v-model="search" @input="applyFilters" placeholder="Search drivers…"
                            class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                    </div>
                    <select v-model="routeFilter" @change="applyFilters"
                        class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                        <option value="All">Route: All</option>
                        <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <select v-model="statusFilter" @change="applyFilters"
                        class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                        <option value="All">Status: All</option>
                        <option value="active">Active</option>
                        <option value="idle">Idle</option>
                        <option value="offline">Offline</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
                        <Download class="h-4 w-4" /> Export
                    </button>
                </div>

                <!-- Drivers Table -->
                <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    <th class="px-4 py-3 w-8"><input type="checkbox" :checked="allSelected" @change="toggleAll" class="rounded" /></th>
                                    <th class="px-4 py-3">Name</th>
                                    <th class="px-4 py-3">Emp ID</th>
                                    <th class="px-4 py-3">Route</th>
                                    <th class="px-4 py-3">Shuttle</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3">Last Active</th>
                                    <th class="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="d in drivers.data" :key="d.id"
                                    class="border-b border-border/30 last:border-0 hover:bg-accent">
                                    <td class="px-4 py-3">
                                        <input type="checkbox" :checked="selected.includes(d.id)" @change="toggleOne(d.id)" class="rounded" />
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2.5">
                                            <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                                                {{ d.full_name.charAt(0) }}
                                                <span v-if="d.is_online"
                                                    class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                                            </div>
                                            <div class="min-w-0">
                                                <span class="block font-medium text-foreground truncate">{{ d.full_name }}</span>
                                                <span class="block text-xs text-muted-foreground truncate">{{ d.email }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ d.employee_id }}</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(d.route)">{{ d.route }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ d.shuttle }}</td>
                                    <td class="px-4 py-3">
                                        <span class="flex items-center gap-1.5">
                                            <span :class="['h-2 w-2 rounded-full', statusDot(d.status)]" />
                                            <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="statusBadge(d.status)">{{ d.status }}</span>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-xs" :class="lastActiveClass(d)">
                                        <span v-if="d.is_online" class="flex items-center gap-1"><CircleDot class="h-3 w-3" /> Online now</span>
                                        <span v-else>{{ d.last_active }}</span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-1">
                                            <Link :href="`/drivers/${d.id}`"
                                                class="inline-flex items-center gap-1 rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent">
                                                <Eye class="h-3.5 w-3.5" /> View
                                            </Link>
                                            <button @click="openEdit(d)"
                                                class="inline-flex items-center gap-1 rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent">
                                                <Edit class="h-3.5 w-3.5" /> Edit
                                            </button>
                                            <div class="relative">
                                                <button @click="toggleMenu(d.id)"
                                                    class="rounded-lg border border-border/70 p-1.5 text-muted-foreground hover:bg-accent">
                                                    <MoreHorizontal class="h-4 w-4" />
                                                </button>
                                                <div v-if="openMenu === d.id"
                                                    class="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-border/50 bg-card py-1 shadow-lg">
                                                    <button @click="openResetPassword(d)"
                                                        class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                        <Key class="h-4 w-4" /> Reset Password
                                                    </button>
                                                    <hr class="my-1 border-border/50" />
                                                    <button @click="startDelete(d, 'deactivate')"
                                                        class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">
                                                        <Trash2 class="h-4 w-4" /> Deactivate
                                                    </button>
                                                    <button @click="startDelete(d, 'archive')"
                                                        class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10">
                                                        <Archive class="h-4 w-4" /> Archive
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Empty state -->
                                <tr v-if="drivers.data.length === 0">
                                    <td colspan="8" class="px-4 py-14 text-center">
                                        <UserPlus class="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p class="text-sm text-muted-foreground mb-3">No drivers found.</p>
                                        <button @click="showCreateDrawer = true"
                                            class="inline-flex items-center gap-1.5 rounded-lg bg-[#8B0000] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#700000]">
                                            <UserPlus class="h-3.5 w-3.5" /> Create Driver
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="flex items-center justify-between border-t border-border/50 px-4 py-3 text-sm text-muted-foreground">
                        <span>Showing {{ drivers.data.length }} of {{ drivers.total }} drivers</span>
                        <div class="flex items-center gap-1">
                            <template v-for="link in drivers.links" :key="link.label">
                                <Link v-if="link.url" :href="link.url"
                                    class="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                    :class="link.active ? 'bg-[#8B0000] text-white' : 'border border-border/70 text-muted-foreground hover:bg-accent'"
                                    v-html="link.label" />
                                <span v-else class="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/50" v-html="link.label" />
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Bulk actions -->
                <div v-if="selected.length > 0" class="flex items-center gap-4">
                    <span class="text-sm text-muted-foreground">{{ selected.length }} selected</span>
                    <button class="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10">
                        <Trash2 class="h-4 w-4" /> Deactivate Selected
                    </button>
                </div>
            </section>

            <!-- ═══════════════════════════════════════════
                 SHUTTLE MANAGEMENT
                 ═══════════════════════════════════════════ -->
            <section class="space-y-5">
                <h2 class="text-2xl font-bold text-foreground">Shuttle Management</h2>

                <!-- Shuttle Filter bar -->
                <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="flex flex-1 items-center gap-2 rounded-lg border border-border/70 px-3 py-2 min-w-52">
                        <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input v-model="shuttleSearch" placeholder="Search shuttles…"
                            class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                    </div>
                    <select v-model="shuttleRouteFilter"
                        class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                        <option value="All">Route: All</option>
                        <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <select v-model="shuttleStatusFilter"
                        class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                        <option value="All">Status: All</option>
                        <option value="active">Active</option>
                        <option value="idle">Idle</option>
                        <option value="offline">Offline</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                    <select v-model="shuttleTypeFilter"
                        class="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none">
                        <option value="All">Type: All</option>
                        <option value="van">Van</option>
                        <option value="minibus">Minibus</option>
                        <option value="bus">Bus</option>
                    </select>
                </div>

                <!-- Shuttle Table -->
                <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    <th class="px-4 py-3">Shuttle</th>
                                    <th class="px-4 py-3">Type</th>
                                    <th class="px-4 py-3">Plate</th>
                                    <th class="px-4 py-3">Capacity</th>
                                    <th class="px-4 py-3">Route</th>
                                    <th class="px-4 py-3">Driver</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="s in filteredShuttles" :key="s.id"
                                    class="border-b border-border/30 last:border-0 hover:bg-accent">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <Bus class="h-4 w-4 text-muted-foreground" />
                                            <span class="font-medium text-foreground">{{ s.shuttle_code }}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="typeBadge(s.shuttle_type)">{{ typeLabel(s.shuttle_type) }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ s.plate_number }}</td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ s.capacity }} seats</td>
                                    <td class="px-4 py-3">
                                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(s.route)">{{ s.route }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-muted-foreground">{{ s.driver }}</td>
                                    <td class="px-4 py-3">
                                        <span class="flex items-center gap-1.5">
                                            <span :class="['h-2 w-2 rounded-full', shuttleStatusDot(s.status)]" />
                                            <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="shuttleStatusBadge(s.status)">{{ s.status }}</span>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="relative">
                                            <button @click="toggleShuttleMenu(s.id)"
                                                class="rounded-lg border border-border/70 p-1.5 text-muted-foreground hover:bg-accent">
                                                <MoreHorizontal class="h-4 w-4" />
                                            </button>
                                            <div v-if="shuttleMenu === s.id"
                                                class="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-border/50 bg-card py-1 shadow-lg">
                                                <button @click="openShuttleEdit(s)"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                    <Edit class="h-4 w-4" /> Edit Shuttle
                                                </button>
                                                <button @click="openAssignDriver(s)"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                    <Shuffle class="h-4 w-4" /> {{ s.driver_id ? 'Reassign' : 'Assign' }} Driver
                                                </button>
                                                <button v-if="s.driver_id" @click="() => { assigningShuttle = s; assignDriverForm.driver_id = null; submitAssignDriver(); shuttleMenu = null; }"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">
                                                    <UserMinus class="h-4 w-4" /> Unassign Driver
                                                </button>
                                                <hr class="my-1 border-border/50" />
                                                <button v-if="s.status !== 'maintenance'" @click="setShuttleStatus(s, 'maintenance')"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">
                                                    <Wrench class="h-4 w-4" /> Set Maintenance
                                                </button>
                                                <button v-if="s.status !== 'active'" @click="setShuttleStatus(s, 'active')"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-500/10">
                                                    <UserCheck class="h-4 w-4" /> Set Active
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Empty state -->
                                <tr v-if="filteredShuttles.length === 0">
                                    <td colspan="8" class="px-4 py-14 text-center">
                                        <Bus class="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p class="text-sm text-muted-foreground">No shuttles found.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    </AppLayout>

    <!-- ═══ CREATE DRIVER DRAWER ═══ -->
    <Teleport to="body">
        <div v-if="showCreateDrawer" class="fixed inset-0 z-50 flex">
            <div class="flex-1 bg-black/30" @click="showCreateDrawer = false"></div>
            <div class="w-full max-w-md overflow-y-auto bg-card shadow-xl">
                <div class="flex items-center justify-between border-b border-border/70 px-6 py-4">
                    <h2 class="text-base font-semibold text-foreground">Create New Driver</h2>
                    <button @click="showCreateDrawer = false" class="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
                </div>

                <form @submit.prevent="submitCreate" class="p-6 space-y-5">
                    <!-- Section 1: Basic Info -->
                    <div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</p>
                        <div class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Full Name *</label>
                                <input v-model="form.full_name" type="text" required
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                                <p v-if="form.errors.full_name" class="mt-1 text-xs text-red-500">{{ form.errors.full_name }}</p>
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Email *</label>
                                <input v-model="form.email" type="email" required
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                                <p v-if="form.errors.email" class="mt-1 text-xs text-red-500">{{ form.errors.email }}</p>
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">License Number *</label>
                                <input v-model="form.license_number" type="text" required placeholder="e.g. N01-23-456789"
                                    class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000] placeholder:text-muted-foreground" />
                                <p v-if="form.errors.license_number" class="mt-1 text-xs text-red-500">{{ form.errors.license_number }}</p>
                            </div>
                        </div>
                    </div>

                    <hr class="border-border/50" />

                    <!-- Section 2: Assignment -->
                    <div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignment</p>
                        <div class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Assigned Route</label>
                                <select v-model="form.route_id"
                                    class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                                    <option value="">Select route…</option>
                                    <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Assign Shuttle</label>
                                <select v-model="form.shuttle_id"
                                    class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                                    <option value="">— Unassigned —</option>
                                    <option v-for="s in unassignedShuttles" :key="s.id" :value="s.id">{{ s.shuttle_code }}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr class="border-border/50" />

                    <!-- Section 3: Access -->
                    <div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Access</p>
                        <div class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Temp Password *</label>
                                <div class="flex gap-2">
                                    <div class="relative flex-1">
                                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required
                                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                                        <button type="button" @click="showPassword = !showPassword"
                                            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <EyeOff v-if="showPassword" class="h-4 w-4" />
                                            <Eye v-else class="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button type="button" @click="generatePassword"
                                        class="flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent whitespace-nowrap">
                                        <RefreshCw class="h-3.5 w-3.5" /> Generate
                                    </button>
                                </div>
                                <p v-if="form.password && form.password.length < 8" class="mt-1 text-xs text-red-500">Min 8 characters</p>
                                <p v-if="form.errors.password" class="mt-1 text-xs text-red-500">{{ form.errors.password }}</p>
                            </div>
                            <label class="flex items-center gap-2 text-sm text-foreground">
                                <input v-model="form.send_credentials" type="checkbox" class="rounded" />
                                Send credentials via email
                            </label>
                        </div>
                    </div>

                    <hr class="border-border/50" />

                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showCreateDrawer = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="form.processing || !createFormValid"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Create Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

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
                    <!-- Basic Info -->
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

                    <!-- Assignment -->
                    <div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignment</p>
                        <div class="space-y-3">
                            <div>
                                <label class="mb-1 block text-sm font-medium text-foreground">Assigned Shuttle</label>
                                <select v-model="editForm.shuttle_id"
                                    class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                                    <option :value="null">— Unassigned —</option>
                                    <option v-for="s in editShuttleOptions" :key="s.id" :value="s.id">{{ s.shuttle_code }}</option>
                                </select>
                                <p v-if="editForm.errors.shuttle_id" class="mt-1 text-xs text-red-500">{{ editForm.errors.shuttle_id }}</p>
                            </div>
                        </div>
                    </div>

                    <hr class="border-border/50" />

                    <!-- Status -->
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

    <!-- ═══ DELETE / DEACTIVATE / ARCHIVE MODAL ═══ -->
    <Teleport to="body">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="cancelDelete"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full"
                        :class="deleteAction === 'archive' ? 'bg-red-500/15' : 'bg-orange-500/15'">
                        <Archive v-if="deleteAction === 'archive'" class="h-5 w-5 text-red-600 dark:text-red-400" />
                        <AlertTriangle v-else class="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-foreground">
                        {{ deleteAction === 'archive' ? 'Archive Driver?' : 'Deactivate Driver?' }}
                    </h3>
                </div>
                <p class="mb-6 text-sm text-muted-foreground">
                    <template v-if="deleteAction === 'archive'">
                        This will archive <strong class="text-foreground">{{ deletingDriver?.full_name }}</strong>, unassign their shuttle, and mark them offline. Data is preserved for records.
                    </template>
                    <template v-else>
                        Are you sure you want to deactivate <strong class="text-foreground">{{ deletingDriver?.full_name }}</strong>? They will be marked offline.
                    </template>
                </p>
                <div class="flex justify-end gap-3">
                    <button @click="cancelDelete"
                        class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                        Cancel
                    </button>
                    <button @click="confirmDelete" :disabled="deleteCountdown > 0"
                        class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        :class="deleteAction === 'archive' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'">
                        {{ deleteCountdown > 0 ? `Yes (${deleteCountdown}s)` : (deleteAction === 'archive' ? 'Yes, Archive' : 'Yes, Deactivate') }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- ═══ EDIT SHUTTLE MODAL ═══ -->
    <Teleport to="body">
        <div v-if="showShuttleEditModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="showShuttleEditModal = false"></div>
            <div class="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
                <h3 class="mb-5 text-lg font-semibold text-foreground">Edit Shuttle — {{ editingShuttle?.shuttle_code }}</h3>
                <form @submit.prevent="submitShuttleEdit" class="space-y-4">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Shuttle Type *</label>
                        <select v-model="shuttleEditForm.shuttle_type"
                            class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option value="van">Van</option>
                            <option value="minibus">Minibus</option>
                            <option value="bus">Bus</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Plate Number</label>
                        <input v-model="shuttleEditForm.plate_number" type="text"
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Capacity (seats)</label>
                        <input v-model.number="shuttleEditForm.capacity" type="number" min="1" max="100"
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Status</label>
                        <select v-model="shuttleEditForm.status"
                            class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option value="active">Active</option>
                            <option value="idle">Idle</option>
                            <option value="offline">Offline</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <hr class="border-border/50" />
                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showShuttleEditModal = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="shuttleEditForm.processing"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- ═══ ASSIGN DRIVER TO SHUTTLE MODAL ═══ -->
    <Teleport to="body">
        <div v-if="showAssignDriverModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/40" @click="showAssignDriverModal = false"></div>
            <div class="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
                <h3 class="mb-5 text-lg font-semibold text-foreground">
                    Assign Driver — {{ assigningShuttle?.shuttle_code }}
                </h3>
                <form @submit.prevent="submitAssignDriver" class="space-y-4">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Select Driver</label>
                        <select v-model="assignDriverForm.driver_id"
                            class="w-full rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option :value="null">— No Driver —</option>
                            <option v-for="d in allDrivers" :key="d.id" :value="d.id">{{ d.full_name }}</option>
                        </select>
                        <p v-if="assignDriverForm.errors.driver_id" class="mt-1 text-xs text-red-500">{{ assignDriverForm.errors.driver_id }}</p>
                    </div>
                    <hr class="border-border/50" />
                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showAssignDriverModal = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="assignDriverForm.processing"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Assign
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
                        <p class="text-xs text-muted-foreground">{{ resetPwDriver?.full_name }}</p>
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
</template>
