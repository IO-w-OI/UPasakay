<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3';
import { Bell, CircleHelp, LogOut, UserCircle } from 'lucide-vue-next';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { logout } from '@/routes';
import type { BreadcrumbItem } from '@/types';

withDefaults(
    defineProps<{
        breadcrumbs?: BreadcrumbItem[];
    }>(),
    {
        breadcrumbs: () => [],
    },
);

const page = usePage();
const user = page.props.auth?.user;

const handleLogout = () => {
    router.flushAll();
};
</script>

<template>
    <header
        class="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80"
    >
        <!-- Left: sidebar trigger + breadcrumb -->
        <div class="flex items-center gap-2">
            <SidebarTrigger class="-ml-1 text-muted-foreground hover:text-foreground" />
            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>

        <!-- Right: actions -->
        <div class="flex items-center gap-3">
            <!-- Notifications -->
            <button class="relative rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Bell class="h-5 w-5" />
            </button>

            <!-- Help -->
            <button class="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <CircleHelp class="h-5 w-5" />
            </button>

            <!-- Divider -->
            <div class="h-6 w-px bg-border"></div>

            <!-- User -->
            <div class="flex items-center gap-2">
                <UserCircle class="h-7 w-7 text-muted-foreground" />
                <span class="text-sm font-medium text-foreground">{{ user?.name ?? 'Admin' }}</span>
            </div>

            <!-- Logout -->
            <Link
                :href="logout()"
                method="post"
                as="button"
                class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                @click="handleLogout"
                data-test="logout-button"
            >
                <LogOut class="h-4 w-4" />
                Logout
            </Link>
        </div>
    </header>
</template>
