<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { CheckCircle2, Search, ShieldAlert, UserCheck, UserX } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: dashboard().url },
    { title: 'Passengers', href: '/passengers' },
];

type PassengerItem = {
    id: number;
    name: string;
    email: string;
    student_id: string;
    department: string | null;
    passenger_type: string;
    status: 'pending' | 'active' | 'suspended' | 'declined';
    registered_at: string | null;
    proof_document_path: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

const props = defineProps<{
    tab: 'pending' | 'active' | 'reviewed';
    counts: {
        pending: number;
        active: number;
        reviewed: number;
    };
    filters: {
        search?: string;
    };
    passengers: {
        data: PassengerItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: PaginationLink[];
    };
}>();

const search = ref(props.filters.search ?? '');
const selected = ref<number[]>([]);

const isPendingTab = computed(() => props.tab === 'pending');
const allSelected = computed(
    () => props.passengers.data.length > 0 && selected.value.length === props.passengers.data.length,
);

const visibleTabLabel = computed(() => {
    if (props.tab === 'pending') return 'Pending Approvals';
    if (props.tab === 'active') return 'Active Passengers';
    return 'Suspended / Declined';
});

const goToTab = (tab: 'pending' | 'active' | 'reviewed') => {
    router.get(
        '/passengers',
        {
            tab,
            search: search.value || undefined,
        },
        { preserveState: true, replace: true },
    );
};

const applySearch = () => {
    router.get(
        '/passengers',
        {
            tab: props.tab,
            search: search.value || undefined,
        },
        { preserveState: true, replace: true },
    );
};

const toggleAll = () => {
    if (allSelected.value) {
        selected.value = [];
        return;
    }

    selected.value = props.passengers.data.map((p) => p.id);
};

const toggleOne = (id: number) => {
    selected.value = selected.value.includes(id)
        ? selected.value.filter((v) => v !== id)
        : [...selected.value, id];
};

const updateStatus = (id: number, status: PassengerItem['status']) => {
    router.patch(
        `/passengers/${id}/status`,
        { status },
        { preserveScroll: true },
    );
};

const bulkApprove = () => {
    if (selected.value.length === 0) return;

    router.patch(
        '/passengers/bulk-status',
        {
            ids: selected.value,
            status: 'active',
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                selected.value = [];
            },
        },
    );
};

const statusClass = (status: PassengerItem['status']) =>
    ({
        pending: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        active: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        suspended: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        declined: 'bg-zinc-500/15 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300',
    })[status];

const typeLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);
</script>

<template>
    <Head title="Passengers" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="space-y-5 p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-bold text-foreground">Passenger Approvals</h1>
                    <p class="mt-1 text-sm text-muted-foreground">Review, approve, or restrict passenger accounts.</p>
                </div>
                <div class="rounded-xl border border-border/70 bg-card px-3 py-2 text-xs text-muted-foreground">
                    Showing: <span class="font-medium text-foreground">{{ visibleTabLabel }}</span>
                </div>
            </div>

            <div class="rounded-2xl border border-border/70 bg-card p-2 shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                        type="button"
                        class="rounded-xl px-3 py-2 text-sm font-medium transition"
                        :class="props.tab === 'pending'
                            ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'text-muted-foreground hover:bg-accent'"
                        @click="goToTab('pending')"
                    >
                        Pending Approvals ({{ counts.pending }})
                    </button>
                    <button
                        type="button"
                        class="rounded-xl px-3 py-2 text-sm font-medium transition"
                        :class="props.tab === 'active'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'text-muted-foreground hover:bg-accent'"
                        @click="goToTab('active')"
                    >
                        Active Passengers ({{ counts.active }})
                    </button>
                    <button
                        type="button"
                        class="rounded-xl px-3 py-2 text-sm font-medium transition"
                        :class="props.tab === 'reviewed'
                            ? 'bg-zinc-500/15 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300'
                            : 'text-muted-foreground hover:bg-accent'"
                        @click="goToTab('reviewed')"
                    >
                        Suspended / Declined ({{ counts.reviewed }})
                    </button>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="flex min-w-64 flex-1 items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
                    <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        v-model="search"
                        @input="applySearch"
                        placeholder="Search by name, email, or student ID..."
                        class="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <button
                    v-if="isPendingTab && selected.length > 0"
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    @click="bulkApprove"
                >
                    <CheckCircle2 class="h-4 w-4" />
                    Approve Selected ({{ selected.length }})
                </button>
            </div>

            <div class="rounded-2xl border border-border/70 bg-card shadow-sm shadow-black/5 dark:shadow-black/20">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                <th v-if="isPendingTab" class="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        class="rounded"
                                        :checked="allSelected"
                                        @change="toggleAll"
                                    />
                                </th>
                                <th class="px-4 py-3">Name</th>
                                <th class="px-4 py-3">Email / Student ID</th>
                                <th class="px-4 py-3">Registration Date</th>
                                <th class="px-4 py-3">Proof / Document</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr
                                v-for="passenger in passengers.data"
                                :key="passenger.id"
                                class="border-b border-border/30 last:border-0 hover:bg-accent"
                            >
                                <td v-if="isPendingTab" class="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        class="rounded"
                                        :checked="selected.includes(passenger.id)"
                                        @change="toggleOne(passenger.id)"
                                    />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-medium text-foreground">{{ passenger.name }}</div>
                                    <div class="text-xs text-muted-foreground">{{ passenger.department || 'No department' }} • {{ typeLabel(passenger.passenger_type) }}</div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="text-foreground">{{ passenger.email }}</div>
                                    <div class="text-xs text-muted-foreground">{{ passenger.student_id }}</div>
                                </td>
                                <td class="px-4 py-3 text-muted-foreground">{{ passenger.registered_at || 'N/A' }}</td>
                                <td class="px-4 py-3">
                                    <template v-if="passenger.proof_document_path">
                                        <a
                                            :href="`/storage/${passenger.proof_document_path}`"
                                            target="_blank"
                                            class="text-primary hover:underline"
                                        >
                                            View document
                                        </a>
                                    </template>
                                    <template v-else>
                                        <span class="text-muted-foreground">No document</span>
                                    </template>
                                </td>
                                <td class="px-4 py-3">
                                    <span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" :class="statusClass(passenger.status)">
                                        {{ passenger.status }}
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <template v-if="passenger.status === 'pending'">
                                            <button
                                                type="button"
                                                class="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                                @click="updateStatus(passenger.id, 'active')"
                                            >
                                                <UserCheck class="h-3.5 w-3.5" />
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                class="inline-flex items-center gap-1 rounded-md border border-red-500/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-300"
                                                @click="updateStatus(passenger.id, 'declined')"
                                            >
                                                <UserX class="h-3.5 w-3.5" />
                                                Decline
                                            </button>
                                        </template>

                                        <template v-else-if="passenger.status === 'active'">
                                            <button
                                                type="button"
                                                class="inline-flex items-center gap-1 rounded-md border border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                                                @click="updateStatus(passenger.id, 'suspended')"
                                            >
                                                <ShieldAlert class="h-3.5 w-3.5" />
                                                Suspend
                                            </button>
                                        </template>

                                        <template v-else>
                                            <button
                                                type="button"
                                                class="inline-flex items-center gap-1 rounded-md border border-emerald-500/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                                @click="updateStatus(passenger.id, 'active')"
                                            >
                                                <UserCheck class="h-3.5 w-3.5" />
                                                Reactivate
                                            </button>
                                        </template>
                                    </div>
                                </td>
                            </tr>

                            <tr v-if="passengers.data.length === 0">
                                <td :colspan="isPendingTab ? 7 : 6" class="px-4 py-16 text-center">
                                    <div class="mx-auto max-w-sm rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6">
                                        <p class="text-base font-medium text-foreground">All caught up!</p>
                                        <p class="mt-2 text-sm text-muted-foreground">No passengers match this tab right now.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex items-center justify-between border-t border-border/50 px-4 py-3 text-sm text-muted-foreground">
                    <span>{{ passengers.total }} passengers</span>
                    <div class="flex items-center gap-1">
                        <template v-for="link in passengers.links" :key="link.label">
                            <Link
                                v-if="link.url"
                                :href="link.url"
                                class="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                                :class="link.active ? 'bg-[#8B0000] text-white' : 'border border-border/70 text-muted-foreground hover:bg-accent'"
                            >
                                <span v-html="link.label" />
                            </Link>
                            <span v-else class="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/50">
                                <span v-html="link.label" />
                            </span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
