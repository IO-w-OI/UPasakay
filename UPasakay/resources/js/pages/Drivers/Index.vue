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
    ({ active: 'bg-green-100 text-green-700', idle: 'bg-orange-100 text-orange-700', inactive: 'bg-gray-100 text-gray-500' }[s] ?? 'bg-gray-100 text-gray-500');

const routeBadge = (r: string) =>
    ({ South: 'bg-green-100 text-green-700', North: 'bg-blue-100 text-blue-700', 'Cebu City': 'bg-orange-100 text-orange-700' }[r] ?? 'bg-gray-100 text-gray-600');
</script>

<template>
    <Head title="Driver Management" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-gray-900">Driver Management</h1>
                <button
                    @click="showCreateDrawer = true"
                    class="flex items-center gap-2 rounded-xl bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#700000]"
                >
                    <UserPlus class="h-4 w-4" /> Create New Driver
                </button>
            </div>

            <!-- Filter bar -->
            <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 min-w-52">
                    <Search class="h-4 w-4 shrink-0 text-gray-400" />
                    <input v-model="search" @input="applyFilters" placeholder="Search drivers…"
                        class="flex-1 text-sm outline-none placeholder:text-gray-400" />
                </div>
                <select v-model="routeFilter" @change="applyFilters"
                    class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                    <option value="All">Route: All</option>
                    <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                </select>
                <select v-model="statusFilter" @change="applyFilters"
                    class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
                    <option value="All">Status: All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <button class="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    <Download class="h-4 w-4" /> Export
                </button>
            </div>

            <!-- Table -->
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
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
                                class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                <td class="px-4 py-3">
                                    <input type="checkbox" :checked="selected.includes(d.id)"
                                        @change="toggleOne(d.id)" class="rounded" />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2">
                                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                            {{ d.full_name.charAt(0) }}
                                        </div>
                                        <span class="font-medium text-gray-800">{{ d.full_name }}</span>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-gray-500">{{ d.employee_id }}</td>
                                <td class="px-4 py-3">
                                    <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="routeBadge(d.route)">
                                        {{ d.route }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-gray-600">{{ d.shuttle }}</td>
                                <td class="px-4 py-3">
                                    <span class="flex items-center gap-1.5">
                                        <span :class="['h-2 w-2 rounded-full', statusDot(d.status)]"></span>
                                        <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="statusBadge(d.status)">
                                            {{ d.status }}
                                        </span>
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-gray-400 text-xs">{{ d.last_login }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-1">
                                        <Link :href="`/drivers/${d.id}`"
                                            class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                            View
                                        </Link>
                                        <button class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                            Edit
                                        </button>
                                        <div class="relative">
                                            <button @click="toggleMenu(d.id)"
                                                class="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                                                <MoreHorizontal class="h-4 w-4" />
                                            </button>
                                            <div v-if="openMenu === d.id"
                                                class="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                                                <Link :href="`/drivers/${d.id}`"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    <Eye class="h-4 w-4" /> View Profile
                                                </Link>
                                                <button class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    <Edit class="h-4 w-4" /> Edit Details
                                                </button>
                                                <button class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    🔑 Reset Password
                                                </button>
                                                <button class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    🚌 Assign Shuttle
                                                </button>
                                                <button @click="deactivate(d.id)"
                                                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <Trash2 class="h-4 w-4" /> Deactivate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="drivers.data.length === 0">
                                <td colspan="8" class="px-4 py-10 text-center text-sm text-gray-400">No drivers found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                    <span>Showing {{ drivers.data.length }} of {{ drivers.total }} drivers</span>
                    <div class="flex items-center gap-1">
                        <template v-for="link in drivers.links" :key="link.label">
                            <Link v-if="link.url" :href="link.url"
                                class="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                :class="link.active ? 'bg-[#8B0000] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'"
                                v-html="link.label" />
                            <span v-else class="rounded-lg px-2.5 py-1.5 text-xs text-gray-300" v-html="link.label" />
                        </template>
                    </div>
                </div>
            </div>

            <!-- Bulk actions -->
            <div v-if="selected.length > 0" class="flex items-center gap-4">
                <span class="text-sm text-gray-500">{{ selected.length }} selected</span>
                <button class="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    <Trash2 class="h-4 w-4" /> Deactivate Selected
                </button>
            </div>
        </div>
    </AppLayout>

    <!-- Create Driver Drawer -->
    <Teleport to="body">
        <div v-if="showCreateDrawer" class="fixed inset-0 z-50 flex">
            <div class="flex-1 bg-black/30" @click="showCreateDrawer = false"></div>
            <div class="w-full max-w-md overflow-y-auto bg-white shadow-xl">
                <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 class="text-base font-semibold text-gray-900">+ Create New Driver</h2>
                    <button @click="showCreateDrawer = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>

                <form @submit.prevent="submitCreate" class="space-y-4 p-6">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                        <input v-model="form.full_name" type="text" required
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">License Number *</label>
                        <input v-model="form.license_number" type="text" required
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Assigned Route *</label>
                        <select v-model="form.route_id"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option value="">Select route…</option>
                            <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Assign Shuttle</label>
                        <select v-model="form.shuttle_id"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]">
                            <option value="">— Unassigned —</option>
                        </select>
                    </div>

                    <hr class="border-gray-100" />

                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                        <input v-model="form.email" type="email" required
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Temp Password *</label>
                        <input v-model="form.password" type="password" required
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B0000]" />
                    </div>
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                        <input v-model="form.send_credentials" type="checkbox" class="rounded" />
                        Send credentials via email
                    </label>

                    <hr class="border-gray-100" />

                    <div class="flex justify-end gap-3">
                        <button type="button" @click="showCreateDrawer = false"
                            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
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
