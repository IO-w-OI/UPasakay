import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import {
    Colors,
    StyledContainer,
} from '../../components/styles';

import { currentUser } from '../../services/UserStore';
import { apiGet, apiPatch } from '../../services/apiClient';
import { useDriverLocationShare } from '../../hooks/useDriverLocationShare';

const DriverHome = () => {
    // Block Android hardware back button on the dashboard.
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    const router = useRouter();
    const [isOnDuty, setIsOnDuty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [feed, setFeed] = useState(null);

    const { start: startSharing, stop: stopSharing } = useDriverLocationShare();

    const loadFeed = useCallback(async () => {
        setError(null);
        const res = await apiGet('/driver/queue');
        if (res.ok) {
            setFeed(res.data);
        } else {
            setError(res.data?.message || 'Could not load your trip data.');
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadFeed();
    }, [loadFeed]);

    // Refresh whenever the screen regains focus (e.g. back from the trip view).
    useFocusEffect(
        useCallback(() => {
            loadFeed();
        }, [loadFeed])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFeed();
    }, [loadFeed]);

    const toggleDuty = useCallback(async (next) => {
        const prev = isOnDuty;
        setIsOnDuty(next);
        if (next) { startSharing(); } else { stopSharing(); }

        // Sync to backend so the web admin sees online/offline immediately.
        const res = await apiPatch('/driver/status', { on_duty: next });
        if (!res.ok) {
            // Revert UI + sharing so the toggle never lies about real state.
            setIsOnDuty(prev);
            if (prev) { startSharing(); } else { stopSharing(); }
            Alert.alert(
                'Status not updated',
                res.data?.message || 'Could not reach the server. Please try again.'
            );
        }
    }, [isOnDuty, startSharing, stopSharing]);

    // Initialise the toggle from the server ONCE (don't fight the user on
    // later refreshes). If they were already on duty, resume sharing.
    const dutyInitialised = useRef(false);
    useEffect(() => {
        if (feed?.driver && !dutyInitialised.current) {
            dutyInitialised.current = true;
            if (feed.driver.on_duty) {
                setIsOnDuty(true);
                startSharing();
            }
        }
    }, [feed, startSharing]);

    const handleSOS = useCallback(() => {
        Alert.alert(
            'Emergency (SOS)',
            'This will contact dispatch and emergency services immediately. Proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call Now', style: 'destructive', onPress: () => console.log('SOS triggered') },
            ]
        );
    }, []);

    const isSuspended = feed?.driver?.suspended ?? false;
    const shuttle = feed?.shuttle;
    const route = feed?.route;
    const counts = feed?.counts ?? { pending: 0, boarded: 0, capacity: 0 };
    const capacity = counts.capacity || 0;
    const occupied = (counts.boarded || 0) + (counts.accepted || 0);
    const fillPct = capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;

    const headerSubtitle = route && shuttle
        ? `${route.name} · ${shuttle.shuttle_code ?? ''}`.trim()
        : 'No route assigned';

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
                            {feed?.driver?.name || currentUser?.full_name || 'Driver'}
                        </Text>
                        <Text style={styles.headerRoute}>{headerSubtitle}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.sosButton}
                    activeOpacity={0.85}
                    onPress={handleSOS}
                >
                    <Ionicons name="call" size={18} color="#fff" />
                    <Text style={styles.sosText}>SOS</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
                }
            >
                {/* Duty Toggle Card */}
                <View style={[styles.dutyCard, (!isOnDuty || isSuspended) && styles.dutyCardOff]}>
                    <View style={styles.dutyLeft}>
                        <Text style={styles.dutyLabel}>
                            {isSuspended ? 'Suspended' : isOnDuty ? 'On Duty' : 'Off Duty'}
                        </Text>
                        <Text style={styles.dutySubLabel} numberOfLines={2}>
                            {isSuspended
                                ? 'Your account is suspended. Contact the administrator.'
                                : isOnDuty
                                    ? 'Sharing location · available for pickups'
                                    : 'Location hidden · not receiving pickups'}
                        </Text>
                    </View>
                    <View style={styles.dutyRight}>
                        <View style={[styles.dutyPill, (isOnDuty && !isSuspended) ? styles.dutyPillOn : styles.dutyPillOff]}>
                            <Text style={[styles.dutyPillText, { color: (isOnDuty && !isSuspended) ? '#1B5E20' : '#9A2A2A' }]}>
                                {isSuspended ? 'Suspended' : isOnDuty ? 'Active' : 'Offline'}
                            </Text>
                        </View>
                        <Switch
                            value={isOnDuty && !isSuspended}
                            onValueChange={toggleDuty}
                            disabled={isSuspended}
                            trackColor={{ false: '#e0e0e0', true: '#A5D6A7' }}
                            thumbColor={(isOnDuty && !isSuspended) ? '#2E7D32' : '#aaa'}
                        />
                    </View>
                </View>

                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#2E7D32" />
                        <Text style={styles.mutedText}>Loading your trip…</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerBox}>
                        <Ionicons name="cloud-offline-outline" size={36} color="#C62828" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={loadFeed}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{counts.pending}</Text>
                                <Text style={styles.statLabel}>Pending Pickup</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{counts.boarded}</Text>
                                <Text style={styles.statLabel}>Boarded pax</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{capacity}</Text>
                                <Text style={styles.statLabel}>Shuttle Capacity</Text>
                            </View>
                        </View>

                        {/* Capacity fill bar */}
                        <View style={styles.capacityCard}>
                            <View style={styles.capacityRow}>
                                <Text style={styles.capacityLabel}>Seats filled</Text>
                                <Text style={styles.capacityValue}>{occupied} / {capacity || '—'}</Text>
                            </View>
                            <View style={styles.capacityTrack}>
                                <View style={[styles.capacityFill, { width: `${fillPct}%` }]} />
                            </View>
                        </View>

                        {/* Shuttle & Route detail card — mirrors the web admin row */}
                        <View style={styles.detailCard}>
                            <Text style={styles.detailTitle}>Shuttle & Route</Text>
                            <DetailRow label="Shuttle" value={shuttle?.shuttle_code ?? '—'} />
                            <DetailRow label="Type" value={shuttle?.shuttle_type ?? '—'} />
                            <DetailRow label="Plate" value={shuttle?.plate_number ?? '—'} />
                            <DetailRow label="Capacity" value={capacity ? `${capacity} seats` : '—'} />
                            <DetailRow label="Route" value={route?.name ?? 'Unassigned'} />
                            <DetailRow
                                label="Route Path"
                                value={route ? `${route.start_location} to ${route.end_location}` : '—'}
                            />
                            <DetailRow label="Driver" value={feed?.driver?.name ?? '—'} last />
                        </View>

                        {/* Up next preview */}
                        {(() => {
                            const upNext = (feed?.stops ?? []).find((s) => s.waiting > 0);
                            return (
                                <View style={styles.routeCard}>
                                    <View style={styles.routeCardTop}>
                                        <Text style={styles.routeCardLabel}>Up next</Text>
                                        <Text style={styles.routeCardTitle}>
                                            {upNext ? upNext.name : 'No passengers waiting'}
                                        </Text>
                                        <Text style={styles.routeCardSub}>
                                            {upNext
                                                ? `${upNext.waiting} passenger${upNext.waiting !== 1 ? 's' : ''} waiting`
                                                : `${counts.pending} pending · ${counts.boarded} boarded`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.startButton}
                                        activeOpacity={0.8}
                                        onPress={() => router.push('/DriverTrip')}
                                    >
                                        <Text style={styles.startButtonText}>Open Trip View</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })()}
                    </>
                )}
            </ScrollView>
        </StyledContainer>
    );
};

const DetailRow = ({ label, value, last }) => (
    <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    headerBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 4, paddingBottom: 18,
        backgroundColor: 'transparent',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#FFB82E', justifyContent: 'center', alignItems: 'center',
    },
    headerName: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    headerRoute: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#5C7A5C' },
    sosButton: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#C62828', borderRadius: 21, height: 42, paddingHorizontal: 14,
        shadowColor: '#C62828', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35, shadowRadius: 6, elevation: 5,
    },
    sosText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },

    dutyCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    dutyCardOff: { backgroundColor: '#FBEAEA' },
    dutyLeft: { flex: 1, marginRight: 12 },
    dutyLabel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    dutySubLabel: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    dutyRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
    dutyPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    dutyPillOn: { backgroundColor: '#E3F4E6' },
    dutyPillOff: { backgroundColor: '#F6D9D9' },
    dutyPillText: { fontFamily: 'Nunito-Bold', fontSize: 12 },

    statsRow: {
        flexDirection: 'row', marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontFamily: 'Nunito-Bold', fontSize: 26, color: '#1A2E1A' },
    statLabel: { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: '#E0E0E0', marginVertical: 4 },

    capacityCard: {
        marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    capacityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    capacityLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#1A2E1A' },
    capacityValue: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#5C7A5C' },
    capacityTrack: { height: 10, borderRadius: 5, backgroundColor: '#E8F5E9', overflow: 'hidden' },
    capacityFill: { height: 10, borderRadius: 5, backgroundColor: '#2E7D32' },

    detailCard: {
        marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    detailTitle: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A', marginBottom: 10 },
    detailRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    detailLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#888' },
    detailValue: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#1A2E1A', flexShrink: 1, marginLeft: 12 },

    routeCard: {
        marginTop: 4,
        backgroundColor: '#4A1010', borderRadius: 20, padding: 22,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
    },
    routeCardTop: { marginBottom: 20 },
    routeCardLabel: {
        fontFamily: 'Nunito-Bold', fontSize: 12, color: '#FFB82E',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
    },
    routeCardTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#fff', marginBottom: 6 },
    routeCardSub: { fontFamily: 'Nunito-Bold', fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    startButton: {
        backgroundColor: '#FFB82E', borderRadius: 30, height: 50,
        justifyContent: 'center', alignItems: 'center',
    },
    startButtonText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#1A2E1A' },

    centerBox: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
    mutedText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888' },
    errorText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#C62828', textAlign: 'center' },
    retryBtn: {
        backgroundColor: '#2E7D32', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10,
    },
    retryText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
});

export default DriverHome;
