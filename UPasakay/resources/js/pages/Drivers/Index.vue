<script setup lang="ts">
import { Head, Link, router, useForm } from '@inertiajs/vue3';
import { Search, Download, UserPlus, Eye, Edit, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Drivers', href: '/drivers' },
];

const props = defineProps<{
    drivers: {
        data: Array<{
            id: number; employee_id: string; full_name: string;
            status: string; route: string; shuttle: string; last_login: string;
        }>;
        current_page: number; last_page: number; total: number; per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    routes: string[];
    filters: { search?: string; status?: string; route?: string };
}>();

// ── Filters ────────────────────────────────────────────────────────────────
const search     = ref(props.filters.search ?? '');
const statusFilter = ref(props.filters.status ?? 'All');
const routeFilter  = ref(props.filters.route  ?? 'All');

const applyFilters = () => {
    router.get('/drivers', {
        search:  search.value || undefined,
        status:  statusFilter.value !== 'All' ? statusFilter.value : undefined,
        route:   routeFilter.value  !== 'All' ? routeFilter.value  : undefined,
    }, { preserveState: true, replace: true });
};

// ── Select all ────────────────────────────────────────────────────────────
const selected = ref<number[]>([]);
const allSelected = computed(() => selected.value.length === props.drivers.data.length && props.drivers.data.length > 0);
const toggleAll = () => {
    selected.value = allSelected.value ? [] : props.drivers.data.map(d => d.id);
};
const toggleOne = (id: number) => {
    selected.value = selected.value.includes(id)
        ? selected.value.filter(i => i !== id)
        : [...selected.value, id];
};

// ── Create drawer ─────────────────────────────────────────────────────────
const showCreateDrawer = ref(false);
const form = useForm({
    full_name: '', license_number: '', email: '',
    password: '', route_id: '', shuttle_id: '',
    send_credentials: false,
});
const submitCreate = () => {
    form.post('/drivers', { onSuccess: () => { showCreateDrawer.value = false; form.reset(); } });
};

// ── Overflow menu ─────────────────────────────────────────────────────────
const openMenu = ref<number | null>(null);
const toggleMenu = (id: number) => { openMenu.value = openMenu.value === id ? null : id; };

// ── Deactivate ────────────────────────────────────────────────────────────
const deactivate = (id: number) => {
    router.delete(`/drivers/${id}`, { preserveScroll: true });
    openMenu.value = null;
};

// Helpers
const statusDot = (s: string) =>
    ({ active: 'bg-green-500', idle: 'bg-orange-400', inactive: 'bg-gray-400' }[s] ?? 'bg-gray-400');

const statusBadge = (s: string) =>
    ({ active: 'bg-green-500/15 text-green-600 dark:text-green-400', idle: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', inactive: 'bg-muted text-muted-foreground' }[s] ?? 'bg-muted text-muted-foreground');

const routeBadge = (r: string) =>
    ({ South: 'bg-green-500/15 text-green-600 dark:text-green-400', North: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', 'Cebu City': 'bg-orange-500/15 text-orange-600 dark:text-orange-400' }[r] ?? 'bg-muted text-muted-foreground');
</script>

<template>
    <Head title="Driver Management" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-foreground">Driver Management</h1>
                <button
                    @click="showCreateDrawer = true"
                    class="flex items-center gap-2 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#700000]"
                >
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
                    <option value="inactive">Inactive</option>
                </select>
                <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
                    <Download class="h-4 w-4" /> Export
                </button>
            </div>

            <!-- Table -->
            <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                <th class="px-4 py-3 w-8">
                                    <input type="checkbox" :checked="allSelected" @change="toggleAll" class="rounded" />
                                </th>
                                <th class="px-4 py-3">Name</th>
                                <th class="px-4 py-3">Emp ID</th>
                                <th class="px-4 py-3">Route</th>
                                <th class="px-4 py-3">Shuttle</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Last Login</th>
                                <th class="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="d in drivers.data" :key="d.id"
                                class="border-b border-border/30 last:border-0 hover:bg-accent">
                                <td class="px-4 py-3">
                                    <input type="checkbox" :checked="selected.includes(d.id)"
                                        @change="toggleOne(d.id)" class="rounded" />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2">
                                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                                            {{ d.full_name.charAt(0) }}
                                        </div>
                                        <span class="font-medium text-foreground">{{ d.full_name }}</span>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-muted-foreground">{{ d.employee_id }}</td>
                                <td class="px-4 py-3">
                                    <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(d.route)">
                                        {{ d.route }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-muted-foreground">{{ d.shuttle }}</td>
                                <td class="px-4 py-3">
                                    <span class="flex items-center gap-1.5">
                                        <span :class="['h-2 w-2 rounded-full', statusDot(d.status)]"></span>
                                        <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="statusBadge(d.status)">
                                            {{ d.status }}
                                        </span>
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-muted-foreground text-xs">{{ d.last_login }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-1">
                                        <Link :href="`/drivers/${d.id}`"
                                            class="rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent">
                                            View
                                        </Link>
                                        <button class="rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent">
                                            Edit
                                        </button>
                                        <div class="relative">
                                            <button @click="toggleMenu(d.id)"
                                                class="rounded-lg border border-border/70 p-1.5 text-muted-foreground hover:bg-accent">
                                                <MoreHorizontal class="h-4 w-4" />
                                            </button>
                                            <div v-if="openMenu === d.id"
                                                class="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-border/50 bg-card py-1 shadow-lg">
                                                <Link :href="`/drivers/${d.id}`"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                    <Eye class="h-4 w-4" /> View Profile
                                                </Link>
                                                <button class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                    <Edit class="h-4 w-4" /> Edit Details
                                                </button>
                                                <button class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                    <Key class="h-4 w-4" /> Reset Password
                                                </button>
                                                <button class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent">
                                                    <Bus class="h-4 w-4" /> Assign Shuttle
                                                </button>
                                                <button @click="deactivate(d.id)"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10">
                                                    <Trash2 class="h-4 w-4" /> Deactivate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="drivers.data.length === 0">
                                <td colspan="8" class="px-4 py-10 text-center text-sm text-muted-foreground">No drivers found.</td>
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
        </div>
    </AppLayout>

    <!-- Create Driver Drawer -->
    <Teleport to="body">
        <div v-if="showCreateDrawer" class="fixed inset-0 z-50 flex">
            <div class="flex-1 bg-black/30" @click="showCreateDrawer = false"></div>
            <div class="w-full max-w-md overflow-y-auto bg-card shadow-xl">
                <div class="flex items-center justify-between border-b border-border/70 px-6 py-4">
                    <h2 class="text-base font-semibold text-foreground">+ Create New Driver</h2>
                    <button @click="showCreateDrawer = false" class="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
                </div>

                <form @submit.prevent="submitCreate" class="space-y-4 p-6">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Full Name *</label>
                        <input v-model="form.full_name" type="text" required
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">License Number *</label>
                        <input v-model="form.license_number" type="text" required
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Assigned Route *</label>
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
                        </select>
                    </div>

                    <hr class="border-border/50" />

                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Email *</label>
                        <input v-model="form.email" type="email" required
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-foreground">Temp Password *</label>
                        <input v-model="form.password" type="password" required
                            class="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <label class="flex items-center gap-2 text-sm text-foreground">
                        <input v-model="form.send_credentials" type="checkbox" class="rounded" />
                        Send credentials via email
                    </label>

                    <hr class="border-border/50" />

                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showCreateDrawer = false"
                            class="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Cancel
                        </button>
                        <button type="submit" :disabled="form.processing"
                            class="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#700000] disabled:opacity-50">
                            Create Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>
