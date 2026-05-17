import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Pusher } from 'pusher-js/react-native';

import { StyledContainer, Colors } from '../../components/styles';
import { apiGet, apiPatch } from '../../services/apiClient';
import { useDriverLocationShare } from '../../hooks/useDriverLocationShare';

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY ?? 'f21efd02988d084b7b35';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER ?? 'ap1';

const DriverTrip = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [feed, setFeed] = useState(null);
    const [expandedStopId, setExpandedStopId] = useState(null);
    const [actingId, setActingId] = useState(null);
    const pusherRef = useRef(null);

    // Keep GPS streaming to passengers while the trip view is open — there is
    // no map UI here on purpose (driver safety), but the bus must stay visible.
    const { start: startSharing, stop: stopSharing } = useDriverLocationShare();

    const loadFeed = useCallback(async () => {
        setError(null);
        const res = await apiGet('/driver/queue');
        if (res.ok) {
            setFeed(res.data);
        } else {
            setError(res.data?.message || 'Could not load the trip.');
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadFeed();
        startSharing();
        return () => { stopSharing(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Real-time: refresh queue/counts on new bookings or ride-accepted events.
    useEffect(() => {
        const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER, forceTLS: true });
        pusherRef.current = pusher;

        const bookingCh = pusher.subscribe('driver-requests');
        bookingCh.bind('passenger.booked', () => loadFeed());

        const adminCh = pusher.subscribe('admin-rides');
        adminCh.bind('ride.accepted', () => loadFeed());

        return () => {
            bookingCh.unbind_all();
            adminCh.unbind_all();
            pusher.unsubscribe('driver-requests');
            pusher.unsubscribe('admin-rides');
            pusher.disconnect();
            pusherRef.current = null;
        };
    }, [loadFeed]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFeed();
    }, [loadFeed]);

    const act = useCallback(async (request, kind) => {
        const endpoints = {
            board: `/pickup-requests/${request.id}/board`,
            'no-show': `/pickup-requests/${request.id}/no-show`,
            decline: `/pickup-requests/${request.id}/decline`,
        };
        setActingId(request.id);
        const res = await apiPatch(endpoints[kind], {});
        setActingId(null);
        if (res.ok) {
            await loadFeed();
        } else {
            Alert.alert('Action failed', res.data?.message || 'Please try again.');
        }
    }, [loadFeed]);

    const confirmAction = (request, kind, label) => {
        Alert.alert(
            `${label}?`,
            `${request.passenger} — ${request.pickup_stop ?? 'this stop'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: label,
                    style: kind === 'board' ? 'default' : 'destructive',
                    onPress: () => act(request, kind),
                },
            ]
        );
    };

    const stops = feed?.stops ?? [];
    const queue = feed?.queue ?? [];
    const route = feed?.route;
    const upNext = stops.find((s) => s.waiting > 0);

    const passengersAtStop = (stopId) =>
        queue.filter((q) => q.pickup_stop_id === stopId && q.status !== 'cancelled' && q.status !== 'completed');

    return (
        <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#1A2E1A" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{route?.name ?? 'Trip'}</Text>
                    {route ? (
                        <Text style={styles.headerSub}>{route.start_location} → {route.end_location}</Text>
                    ) : null}
                </View>
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.mutedText}>Loading trip…</Text>
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
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
                    }
                >
                    {/* Big "Up next" card */}
                    <View style={styles.upNextCard}>
                        <Text style={styles.upNextLabel}>UP NEXT</Text>
                        <Text style={styles.upNextStop}>
                            {upNext ? upNext.name : 'No passengers waiting'}
                        </Text>
                        {upNext ? (
                            <Text style={styles.upNextMeta}>
                                {upNext.waiting} passenger{upNext.waiting !== 1 ? 's' : ''} waiting
                                {' · Stop '}{upNext.sequence + 1}
                            </Text>
                        ) : (
                            <Text style={styles.upNextMeta}>You&apos;re all caught up.</Text>
                        )}
                    </View>

                    {/* Ordered stop list */}
                    {stops.map((stop) => {
                        const isOpen = expandedStopId === stop.id;
                        const pax = passengersAtStop(stop.id);
                        return (
                            <View key={stop.id} style={styles.stopCard}>
                                <TouchableOpacity
                                    style={styles.stopHeader}
                                    activeOpacity={0.7}
                                    onPress={() => setExpandedStopId(isOpen ? null : stop.id)}
                                >
                                    <View style={styles.seqBadge}>
                                        <Text style={styles.seqText}>{stop.sequence + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.stopName}>{stop.name}</Text>
                                        <Text style={styles.stopMeta}>
                                            {stop.waiting} waiting
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#5C7A5C"
                                    />
                                </TouchableOpacity>

                                {isOpen && (
                                    <View style={styles.paxList}>
                                        {pax.length === 0 ? (
                                            <Text style={styles.emptyPax}>No active passengers at this stop.</Text>
                                        ) : (
                                            pax.map((p) => (
                                                <View key={p.id} style={styles.paxRow}>
                                                    <View style={styles.paxInfo}>
                                                        <MaterialCommunityIcons name="account" size={20} color="#1A2E1A" />
                                                        <View style={{ marginLeft: 8, flex: 1 }}>
                                                            <Text style={styles.paxName}>{p.passenger}</Text>
                                                            <Text style={styles.paxStatus}>
                                                                {p.status === 'in_progress' ? 'Boarded' :
                                                                 p.status === 'accepted' ? 'Confirmed' : 'Waiting'}
                                                                {p.dropoff_stop ? ` · to ${p.dropoff_stop}` : ''}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {p.status !== 'in_progress' && (
                                                        <View style={styles.paxActions}>
                                                            <TouchableOpacity
                                                                style={[styles.actionBtn, styles.boardBtn]}
                                                                disabled={actingId === p.id}
                                                                onPress={() => confirmAction(p, 'board', 'Boarded')}
                                                            >
                                                                <Ionicons name="checkmark" size={18} color="#fff" />
                                                                <Text style={styles.actionText}>Boarded</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[styles.actionBtn, styles.noShowBtn]}
                                                                disabled={actingId === p.id}
                                                                onPress={() => confirmAction(p, 'no-show', 'No-Show')}
                                                            >
                                                                <Text style={styles.actionTextDark}>No-Show</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[styles.actionBtn, styles.declineBtn]}
                                                                disabled={actingId === p.id}
                                                                onPress={() => confirmAction(p, 'decline', 'Decline')}
                                                            >
                                                                <Ionicons name="close" size={18} color="#fff" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            ))
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {stops.length === 0 && (
                        <View style={styles.centerBox}>
                            <Ionicons name="bus-outline" size={36} color="#8E8E93" />
                            <Text style={styles.mutedText}>No stops on this route yet.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </StyledContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 20, color: '#1A2E1A' },
    headerSub: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#5C7A5C', marginTop: 2 },

    upNextCard: {
        marginHorizontal: 20, marginBottom: 18,
        backgroundColor: '#4A1010', borderRadius: 20, padding: 24,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
    },
    upNextLabel: {
        fontFamily: 'Nunito-Bold', fontSize: 13, color: '#FFB82E',
        letterSpacing: 1.5, marginBottom: 8,
    },
    upNextStop: { fontFamily: 'Nunito-Bold', fontSize: 26, color: '#fff', marginBottom: 6 },
    upNextMeta: { fontFamily: 'Nunito-Bold', fontSize: 15, color: 'rgba(255,255,255,0.9)' },

    stopCard: {
        marginHorizontal: 20, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
        overflow: 'hidden',
    },
    stopHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    seqBadge: {
        width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center',
    },
    seqText: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#2E7D32' },
    stopName: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    stopMeta: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },

    paxList: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 8 },
    emptyPax: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#999', paddingVertical: 14, textAlign: 'center' },
    paxRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    paxInfo: { flexDirection: 'row', alignItems: 'center' },
    paxName: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A' },
    paxStatus: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    paxActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
        paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    },
    boardBtn: { backgroundColor: '#2E7D32', flex: 1 },
    noShowBtn: { backgroundColor: '#FFE0B2', flex: 1 },
    declineBtn: { backgroundColor: '#C62828', width: 50 },
    actionText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
    actionTextDark: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#8A5A00' },

    centerBox: { alignItems: 'center', justifyContent: 'center', padding: 50, gap: 12 },
    mutedText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888' },
    errorText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#C62828', textAlign: 'center' },
    retryBtn: { backgroundColor: '#2E7D32', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
});

export default DriverTrip;
