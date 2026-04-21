import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors, StyledContainer } from '../../components/styles';
import { currentUser } from '../../services/UserStore';

const DriverHome = () => {
    const router = useRouter();
    const [isOnDuty, setIsOnDuty] = useState(false);

    const nearbyRequests = [
        { id: 1, name: 'Sisa Santos',      location: 'Jollibee',  distance: '0.3 km' },
        { id: 2, name: 'Cuervo dela Cruz', location: 'AS Gate 2', distance: '0.7 km' },
    ];

    const stats = { pendingPickup: 6, boardedPax: 12, shuttleCapacity: 20 };

    // ─── OFF DUTY ───────────────────────────────────────────────────────────────
    if (!isOnDuty) {
        return (
            <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
                <StatusBar style="dark" />

                {/* Top greeting */}
                <View style={styles.offHeader}>
                    <View style={styles.offAvatar}>
                        <MaterialCommunityIcons name="account" size={30} color="#1A2E1A" />
                    </View>
                    <View>
                        <Text style={styles.offGreeting}>Good day,</Text>
                        <Text style={styles.offName}>
                            {currentUser?.name ? currentUser.name.split(' ')[0] : 'Driver'}
                        </Text>
                    </View>
                </View>

                {/* Status Card */}
                <View style={styles.offStatusCard}>
                    <View style={styles.offStatusDot} />
                    <Text style={styles.offStatusTitle}>You are Off Duty</Text>
                    <Text style={styles.offStatusSub}>
                        Go on duty to start accepting passengers and view your route.
                    </Text>

                    {/* Toggle */}
                    <View style={styles.offToggleRow}>
                        <Text style={styles.offToggleLabel}>Go On Duty</Text>
                        <Switch
                            value={isOnDuty}
                            onValueChange={setIsOnDuty}
                            trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#A5D6A7' }}
                            thumbColor={isOnDuty ? '#2E7D32' : '#fff'}
                        />
                    </View>
                </View>

                {/* Route Options */}
                <Text style={styles.offSectionTitle}>Available Routes</Text>

                <TouchableOpacity
                    style={styles.offRouteCard}
                    activeOpacity={0.8}
                    onPress={() => setIsOnDuty(true)}
                >
                    <View style={styles.offRouteIconBox}>
                        <Ionicons name="bus" size={22} color="#1A2E1A" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.offRouteName}>South Bound</Text>
                        <Text style={styles.offRouteSub}>Talamban → UP Cebu</Text>
                    </View>
                    <View style={styles.offRouteBadge}>
                        <Text style={styles.offRouteBadgeText}>Drive</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.offRouteCard}
                    activeOpacity={0.8}
                    onPress={() => setIsOnDuty(true)}
                >
                    <View style={styles.offRouteIconBox}>
                        <Ionicons name="bus" size={22} color="#1A2E1A" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.offRouteName}>North Bound</Text>
                        <Text style={styles.offRouteSub}>UP Cebu → Talamban</Text>
                    </View>
                    <View style={[styles.offRouteBadge, { backgroundColor: '#FFB82E' }]}>
                        <Text style={styles.offRouteBadgeText}>Pickup</Text>
                    </View>
                </TouchableOpacity>

            </StyledContainer>
        );
    }

    // ─── ON DUTY ────────────────────────────────────────────────────────────────
    return (
        <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />

            {/* Header Bar */}
            <View style={styles.headerBar}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarCircle}>
                        <MaterialCommunityIcons name="account" size={22} color="#1A2E1A" />
                    </View>
                    <View>
                        <Text style={styles.headerName}>
                            {currentUser?.name || 'Ben Dela Cruz'}
                        </Text>
                        <Text style={styles.headerRoute}>South Bound · SH-0001</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.bellButton}>
                    <Ionicons name="notifications-outline" size={24} color="#1A2E1A" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Duty Toggle Card */}
                <View style={styles.dutyCard}>
                    <View>
                        <Text style={styles.dutyLabel}>On Duty</Text>
                        <Text style={styles.dutySubLabel}>Available for pickups</Text>
                    </View>
                    <View style={styles.dutyRight}>
                        <Text style={[styles.dutyStatus, { color: '#2E7D32' }]}>Active</Text>
                        <Switch
                            value={isOnDuty}
                            onValueChange={setIsOnDuty}
                            trackColor={{ false: '#e0e0e0', true: '#A5D6A7' }}
                            thumbColor="#2E7D32"
                        />
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.pendingPickup}</Text>
                        <Text style={styles.statLabel}>Pending Pickup</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.boardedPax}</Text>
                        <Text style={styles.statLabel}>Boarded pax</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.shuttleCapacity}</Text>
                        <Text style={styles.statLabel}>Shuttle Capacity</Text>
                    </View>
                </View>

                {/* Nearby Requests */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Nearby requests</Text>
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>2 new</Text>
                    </View>
                </View>

                {nearbyRequests.map((req) => (
                    <TouchableOpacity key={req.id} style={styles.nearbyCard} activeOpacity={0.75}>
                        <View style={styles.nearbyAvatar}>
                            <MaterialCommunityIcons name="account" size={20} color="#1A2E1A" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nearbyName}>{req.name}</Text>
                            <Text style={styles.nearbyLocation}>{req.location}</Text>
                        </View>
                        <Text style={styles.nearbyDistance}>{req.distance}</Text>
                    </TouchableOpacity>
                ))}

                {/* Route Card */}
                <View style={styles.routeCard}>
                    <View style={styles.routeCardTop}>
                        <Text style={styles.routeCardTitle}>South Bound</Text>
                        <Text style={styles.routeCardSub}>Talamban → UP Cebu</Text>
                        <Text style={styles.routeCardSub}>8 stops · 3 pax confirmed</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.startButton}
                        activeOpacity={0.8}
                        onPress={() => router.push('/(tabs)/Drivers/DriverMap')}
                    >
                        <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </StyledContainer>
    );
};

const styles = StyleSheet.create({
    // ── Off Duty ──────────────────────────────────────────────────────────────
    offHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24,
    },
    offAvatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#FFB82E', justifyContent: 'center', alignItems: 'center',
    },
    offGreeting: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888' },
    offName:     { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#1A2E1A' },

    offStatusCard: {
        marginHorizontal: 20, marginBottom: 28,
        backgroundColor: '#1A2E1A', borderRadius: 24,
        padding: 24, alignItems: 'center',
    },
    offStatusDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#ef9a9a', marginBottom: 12,
    },
    offStatusTitle: {
        fontFamily: 'Nunito-Bold', fontSize: 22, color: '#fff', marginBottom: 8,
    },
    offStatusSub: {
        fontFamily: 'Nunito-Bold', fontSize: 13,
        color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 20,
    },
    offToggleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30, paddingHorizontal: 20, paddingVertical: 10,
    },
    offToggleLabel: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#fff' },

    offSectionTitle: {
        fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A',
        paddingHorizontal: 24, marginBottom: 12,
    },
    offRouteCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    offRouteIconBox: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#E8F5E9', justifyContent: 'center',
        alignItems: 'center', marginRight: 14,
    },
    offRouteName:      { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A' },
    offRouteSub:       { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    offRouteBadge:     { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    offRouteBadgeText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#1A2E1A' },

    // ── On Duty ───────────────────────────────────────────────────────────────
    headerBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    },
    headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#FFB82E', justifyContent: 'center', alignItems: 'center',
    },
    headerName:  { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    headerRoute: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#5C7A5C' },
    bellButton: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
    },
    dutyCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    dutyLabel:    { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    dutySubLabel: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    dutyRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dutyStatus:   { fontFamily: 'Nunito-Bold', fontSize: 13 },
    statsRow: {
        flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    statItem:   { flex: 1, alignItems: 'center' },
    statNumber: { fontFamily: 'Nunito-Bold', fontSize: 26, color: '#1A2E1A' },
    statLabel:  { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: '#E0E0E0', marginVertical: 4 },
    sectionRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginHorizontal: 20, marginBottom: 10,
    },
    sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    newBadge:     { backgroundColor: '#FFB82E', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    newBadgeText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#1A2E1A' },
    nearbyCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 10,
        backgroundColor: '#fff', borderRadius: 14, padding: 14,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    nearbyAvatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    nearbyName:     { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#1A2E1A' },
    nearbyLocation: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888' },
    nearbyDistance: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#5C7A5C' },
    routeCard: {
        marginHorizontal: 20, marginTop: 10,
        backgroundColor: '#4A1010', borderRadius: 20, padding: 22,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
    },
    routeCardTop:   { marginBottom: 20 },
    routeCardTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#fff', marginBottom: 6 },
    routeCardSub:   { fontFamily: 'Nunito-Bold', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    startButton: {
        backgroundColor: '#FFB82E', borderRadius: 30, height: 50,
        justifyContent: 'center', alignItems: 'center',
    },
    startButtonText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#1A2E1A' },
});

export default DriverHome;