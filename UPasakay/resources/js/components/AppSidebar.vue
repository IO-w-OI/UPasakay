<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { LayoutGrid, Map, Users, ClipboardList, Bell, MessageSquare, Settings, UserCheck2 } from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import { type NavItem } from '@/types';
import AppLogo from './AppLogo.vue';

const page = usePage();
const pendingPassengers = Number((page.props as any)?.approval?.pendingPassengers ?? 0);

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Live Map', href: '/live-map', icon: Map },
    { title: 'Drivers & Shuttles', href: '/drivers', icon: Users },
    { title: 'Requests', href: '/pickup-requests', icon: ClipboardList },
    { title: 'Passengers', href: '/passengers', icon: UserCheck2, badge: pendingPassengers || undefined },
    { title: 'Notifications', href: '/notifications', icon: Bell },
    { title: 'Feedback & Reports', href: '/feedback', icon: MessageSquare },
    { title: 'Settings', href: editProfile(), icon: Settings },
];
</script>

<template>
    <Sidebar collapsible="icon">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

    </Sidebar>
    <slot />
</template>
