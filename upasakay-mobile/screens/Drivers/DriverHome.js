import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
    BasePage,
    ButtonText,
    Colors,
    Header,
    PageLogo,
    StyledButton,
    StyledContainer,
    SubHeader,
    UserName,
} from '../../components/styles';

import { currentUser } from '../../services/UserStore';
import { apiGet } from '../../services/apiClient';
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
        setIsOnDuty(next);
        if (next) {
            await startSharing();
        } else {
            await stopSharing();
        }
    }, [startSharing, stopSharing]);

    const shuttle = feed?.shuttle;
    const route = feed?.route;
    const counts = feed?.counts ?? { pending: 0, boarded: 0, capacity: 0 };
    const capacity = counts.capacity || 0;
    const occupied = (counts.boarded || 0) + (counts.accepted || 0);
    const fillPct = capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;

    const headerSubtitle = route && shuttle
        ? `${route.name} · ${shuttle.shuttle_code ?? ''}`.trim()
        : 'No route assigned';

    // ─── OFF DUTY: Simple Welcome Screen ───────────────────────────────────────
    if (!isOnDuty) {
        return (
            <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
                <StatusBar style="dark" />
                <BasePage style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <PageLogo
                        resizeMode="contain"
                        source={require('../../assets/images/UPasakayBig.png')}
                        style={{ width: 723 * 0.5, height: 406 * 0.5, marginBottom: 16 }}
                    />

                    <Header>
                        Welcome, <UserName style={{ fontSize: 30 }}>
                            {currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'Driver'}
                        </UserName>!
                    </Header>

                    <SubHeader style={{ marginBottom: 32, textAlign: 'center' }}>
                        You are currently off duty.
                    </SubHeader>

                    {/* Go on duty AND open the trip flow */}
                    <StyledButton
                        onPress={async () => { await toggleDuty(true); router.push('/DriverTrip'); }}
                        style={{ width: '100%', height: 54, marginBottom: 14 }}
                    >
                        <ButtonText style={{ fontSize: 20, color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}>
                            Drive
                        </ButtonText>
                    </StyledButton>

                    {/* Go on duty, pickups only — stays on dashboard */}
                    <StyledButton
                        onPress={() => toggleDuty(true)}
                        style={{ width: '100%', height: 54, backgroundColor: '#FFB82E' }}
                    >
                        <ButtonText style={{ fontSize: 20, color: '#1A2E1A', fontFamily: 'Nunito-Bold' }}>
                            Pickup
                        </ButtonText>
                    </StyledButton>
                </BasePage>
            </StyledContainer>
        );
    }

    // ─── ON DUTY: Active Dashboard ──────────────────────────────────────────────
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
                    style={styles.bellButton}
                    onPress={() => router.push('/(tabs)/Drivers/DriverRecents')}
                >
                    <Ionicons name="notifications-outline" size={24} color="#1A2E1A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
                }
            >
                {/* Duty Toggle Card */}
                <View style={styles.dutyCard}>
                    <View>
                        <Text style={styles.dutyLabel}>On Duty</Text>
                        <Text style={styles.dutySubLabel}>Sharing location · available for pickups</Text>
                    </View>
                    <View style={styles.dutyRight}>
                        <Text style={[styles.dutyStatus, { color: isOnDuty ? '#2E7D32' : '#C62828' }]}>
                            {isOnDuty ? 'Active' : 'Inactive'}
                        </Text>
                        <Switch
                            value={isOnDuty}
                            onValueChange={toggleDuty}
                            trackColor={{ false: '#e0e0e0', true: '#A5D6A7' }}
                            thumbColor={isOnDuty ? '#2E7D32' : '#aaa'}
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
                                label="From → To"
                                value={route ? `${route.start_location} → ${route.end_location}` : '—'}
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
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#FFB82E', justifyContent: 'center', alignItems: 'center',
    },
    headerName: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
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
    dutyLabel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    dutySubLabel: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    dutyRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dutyStatus: { fontFamily: 'Nunito-Bold', fontSize: 13 },

    statsRow: {
        flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontFamily: 'Nunito-Bold', fontSize: 26, color: '#1A2E1A' },
    statLabel: { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: '#E0E0E0', marginVertical: 4 },

    capacityCard: {
        marginHorizontal: 20, marginBottom: 16,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    capacityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    capacityLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#1A2E1A' },
    capacityValue: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#5C7A5C' },
    capacityTrack: { height: 10, borderRadius: 5, backgroundColor: '#E8F5E9', overflow: 'hidden' },
    capacityFill: { height: 10, borderRadius: 5, backgroundColor: '#2E7D32' },

    detailCard: {
        marginHorizontal: 20, marginBottom: 16,
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
        marginHorizontal: 20, marginTop: 4,
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
