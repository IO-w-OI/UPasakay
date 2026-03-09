<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { LayoutGrid, Map, Bus, Users, ClipboardList, Bell, MessageSquare, Settings } from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import AppLogo from './AppLogo.vue';
import { dashboard } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Live Map', href: '/live-map', icon: Map },
    { title: 'Shuttles', href: '#', icon: Bus },
    { title: 'Drivers', href: '/drivers', icon: Users },
    { title: 'Requests', href: '/pickup-requests', icon: ClipboardList },
    { title: 'Notifications', href: '/notifications', icon: Bell, badge: 3 },
    { title: 'Feedback', href: '/feedback', icon: MessageSquare },
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
                    <SidebarTrigger class="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white" />
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
