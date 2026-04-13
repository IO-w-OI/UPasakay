<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { Search, UserPlus, Edit, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-vue-next';
import { ref, onBeforeUnmount } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Admin Accounts', href: '/admins' },
];

interface AdminItem {
    id: number;
    email: string;
    access_level: number;
    access_level_label: string;
    created_at: string;
    updated_at: string;
}

const props = defineProps<{
    admins: {
        data: AdminItem[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        access_level?: string;
    };
}>();

// ── Filters ────────────────────────────────────────────────────────────────
const search = ref(props.filters.search ?? '');
const accessLevelFilter = ref(props.filters.access_level ?? 'All');

const applyFilters = () => {
    router.get('/admins', {
        search: search.value || undefined,
        access_level: accessLevelFilter.value !== 'All' ? accessLevelFilter.value : undefined,
    }, { preserveState: true, replace: true });
};

// ── Delete ─────────────────────────────────────────────────────────────────
const showDeleteModal = ref(false);
const deletingAdmin = ref<AdminItem | null>(null);
const deleteCountdown = ref(5);
let deleteInterval: ReturnType<typeof setInterval> | null = null;

const startDelete = (admin: AdminItem) => {
    deletingAdmin.value = admin;
    deleteCountdown.value = 5;
    showDeleteModal.value = true;
    openMenu.value = null;
    deleteInterval = setInterval(() => {
        deleteCountdown.value--;
        if (deleteCountdown.value <= 0 && deleteInterval) {
            clearInterval(deleteInterval);
            deleteInterval = null;
        }
    }, 1000);
};

const confirmDelete = () => {
    if (!deletingAdmin.value || deleteCountdown.value > 0) return;
    router.delete(`/admins/${deletingAdmin.value.id}`, {
        preserveScroll: true,
    });
    cancelDelete();
};

const cancelDelete = () => {
    showDeleteModal.value = false;
    deletingAdmin.value = null;
    if (deleteInterval) {
        clearInterval(deleteInterval);
        deleteInterval = null;
    }
};

onBeforeUnmount(() => {
    if (deleteInterval) clearInterval(deleteInterval);
});

// ── Menu ───────────────────────────────────────────────────────────────────
const openMenu = ref<number | null>(null);
const toggleMenu = (id: number) => {
    openMenu.value = openMenu.value === id ? null : id;
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Admin Accounts" />

        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Admin Accounts</h1>
                    <p class="mt-1 text-sm text-gray-600">Manage admin users and their permissions</p>
                </div>
                <Link href="/admins/create" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <UserPlus :size="20" />
                    Create Admin
                </Link>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-lg shadow p-4 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <div class="relative">
                            <Search :size="18" class="absolute left-3 top-3 text-gray-400" />
                            <input
                                v-model="search"
                                type="text"
                                placeholder="Search by email..."
                                @keyup.enter="applyFilters"
                                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                        <select v-model="accessLevelFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="All">All Levels</option>
                            <option value="2">Super Admin</option>
                            <option value="1">Admin</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button
                            @click="applyFilters"
                            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Access Level</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-if="props.admins.data.length === 0" class="hover:bg-gray-50">
                            <td colspan="4" class="px-6 py-8 text-center text-gray-500">No admins found</td>
                        </tr>
                        <tr v-for="admin in props.admins.data" :key="admin.id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ admin.email }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span :class="{
                                    'px-3 py-1 rounded-full text-xs font-medium': true,
                                    'bg-red-100 text-red-800': admin.access_level === 2,
                                    'bg-blue-100 text-blue-800': admin.access_level === 1,
                                }">
                                    {{ admin.access_level_label }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {{ new Date(admin.created_at).toLocaleDateString() }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div class="relative">
                                    <button
                                        @click="toggleMenu(admin.id)"
                                        class="p-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <MoreHorizontal :size="18" class="text-gray-600" />
                                    </button>
                                    <div
                                        v-if="openMenu === admin.id"
                                        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10"
                                    >
                                        <Link
                                            :href="`/admins/${admin.id}/edit`"
                                            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            <Edit :size="16" />
                                            Edit
                                        </Link>
                                        <button
                                            @click="startDelete(admin)"
                                            class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition"
                                        >
                                            <Trash2 :size="16" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination -->
                <div class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <p class="text-sm text-gray-600">
                        Showing {{ (props.admins.current_page - 1) * props.admins.per_page + 1 }} to
                        {{ Math.min(props.admins.current_page * props.admins.per_page, props.admins.total) }} of
                        {{ props.admins.total }} results
                    </p>
                    <div class="flex gap-2">
                        <template v-for="link in props.admins.links" :key="link.label">
                            <Link
                                v-if="link.url"
                                :href="link.url"
                                :class="{
                                    'px-3 py-2 rounded text-sm font-medium transition': true,
                                    'bg-blue-600 text-white': link.active,
                                    'text-gray-700 hover:bg-gray-100': !link.active,
                                }"
                            >
                                <span v-html="link.label"></span>
                            </Link>
                            <span
                                v-else
                                :class="{
                                    'px-3 py-2 rounded text-sm font-medium': true,
                                    'text-gray-400': !link.active,
                                }"
                                v-html="link.label"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div class="bg-white rounded-lg p-6 max-w-sm">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle :size="24" class="text-red-600" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">Delete Admin Account</h3>
                </div>
                <p class="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{{ deletingAdmin?.email }}</strong>? This action cannot be undone.
                </p>
                <div class="flex gap-3">
                    <button
                        @click="cancelDelete"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        @click="confirmDelete"
                        :disabled="deleteCountdown > 0"
                        :class="{
                            'flex-1 px-4 py-2 rounded-lg text-white transition': true,
                            'bg-red-600 hover:bg-red-700': deleteCountdown <= 0,
                            'bg-gray-300 cursor-not-allowed': deleteCountdown > 0,
                        }"
                    >
                        {{ deleteCountdown > 0 ? `Delete (${deleteCountdown}s)` : 'Delete Account' }}
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
