<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { LayoutGrid, Map, Users, ClipboardList, Bell, MessageSquare, Settings } from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { type NavItem } from '@/types';
import AppLogo from './AppLogo.vue';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Live Map', href: '/live-map', icon: Map },
    { title: 'Drivers & Shuttles', href: '/drivers', icon: Users },
    { title: 'Requests', href: '/pickup-requests', icon: ClipboardList },
    { title: 'Notifications', href: '/notifications', icon: Bell },
    { title: 'Feedback & Reports', href: '/feedback', icon: MessageSquare },
    { title: 'Settings', href: editAppearance(), icon: Settings },
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

        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
