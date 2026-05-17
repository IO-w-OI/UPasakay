import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    BasePage,
    Colors,
    Header,
    StyledContainer,
} from '../../components/styles';

import { apiGet } from '../../services/apiClient';

// Read-only activity log. The driver no longer accepts/declines here —
// pickups are auto-accepted by shuttle capacity on the backend; the only
// driver action (Boarded / No-Show / Decline) lives on the trip screen,
// at the point of boarding, never while driving.

const iconForType = (type) => {
    switch (type) {
        case 'alert': return 'notifications';
        case 'delay': return 'time';
        case 'change': return 'swap-horizontal';
        case 'announcement': return 'megaphone';
        default: return 'information-circle';
    }
};

const NotificationCard = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.iconCircle}>
            <Ionicons name={iconForType(item.type)} size={20} color="#1A2E1A" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>{item.date} · {item.time}</Text>
        </View>
    </View>
);

const DriverNotifications = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        const res = await apiGet('/driver/notifications');
        if (res.ok) {
            setItems(res.data?.data ?? []);
        } else {
            setError(res.data?.message || 'Could not load notifications.');
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        load();
    }, [load]);

    return (
        <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <BasePage style={{ flex: 1, paddingHorizontal: 0 }}>
                <View style={styles.headerRow}>
                    <Header style={{ marginBottom: 0 }}>Notifications</Header>
                </View>

                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#2E7D32" />
                        <Text style={styles.mutedText}>Loading…</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerBox}>
                        <Ionicons name="cloud-offline-outline" size={36} color="#C62828" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={load}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
                        }
                    >
                        {items.length === 0 ? (
                            <View style={styles.centerBox}>
                                <Ionicons name="notifications-off-outline" size={36} color="#8E8E93" />
                                <Text style={styles.mutedText}>No notifications yet.</Text>
                            </View>
                        ) : (
                            items.map((item) => <NotificationCard key={item.id} item={item} />)
                        )}
                    </ScrollView>
                )}
            </BasePage>
        </StyledContainer>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 4, paddingBottom: 10,
    },
    card: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    iconCircle: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
    },
    cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A' },
    cardMessage: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#555', marginTop: 3 },
    cardTime: { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#999', marginTop: 6 },

    centerBox: { alignItems: 'center', justifyContent: 'center', padding: 50, gap: 12 },
    mutedText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888' },
    errorText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#C62828', textAlign: 'center' },
    retryBtn: { backgroundColor: '#2E7D32', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
});

export default DriverNotifications;
