import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

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

// Replace with your actual driver store
import { currentUser } from '../../services/UserStore';

const DriverHome = () => {
    const router = useRouter();
    const [isOnDuty, setIsOnDuty] = useState(false);

    // Mock nearby requests — replace with real data later
    const nearbyRequests = [
        { id: 1, name: 'Sisa Santos', location: 'Jollibee', distance: '0.3 km' },
        { id: 2, name: 'Cuervo dela Cruz', location: 'AS Gate 2', distance: '0.7 km' },
    ];

    const stats = {
        pendingPickup: 6,
        boardedPax: 12,
        shuttleCapacity: 20,
    };

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
                            {currentUser?.name ? currentUser.name.split(' ')[0] : 'Driver'}
                        </UserName>!
                    </Header>

                    <SubHeader style={{ marginBottom: 32, textAlign: 'center' }}>
                        You are currently off duty.
                    </SubHeader>

                    {/* Go On Duty */}
                    <StyledButton
                        onPress={() => setIsOnDuty(true)}
                        style={{ width: '100%', height: 54, marginBottom: 14 }}
                    >
                        <ButtonText style={{ fontSize: 20, color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}>
                            Drive
                        </ButtonText>
                    </StyledButton>

                    {/* Pickup only */}
                    <StyledButton
                        onPress={() => setIsOnDuty(true)}
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
                        <Text style={[styles.dutyStatus, { color: isOnDuty ? '#2E7D32' : '#C62828' }]}>
                            {isOnDuty ? 'Active' : 'Inactive'}
                        </Text>
                        <Switch
                            value={isOnDuty}
                            onValueChange={setIsOnDuty}
                            trackColor={{ false: '#e0e0e0', true: '#A5D6A7' }}
                            thumbColor={isOnDuty ? '#2E7D32' : '#aaa'}
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
    // Header
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

    // Duty Card
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

    // Stats
    statsRow: {
        flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontFamily: 'Nunito-Bold', fontSize: 26, color: '#1A2E1A' },
    statLabel: { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: '#E0E0E0', marginVertical: 4 },

    // Nearby Section
    sectionRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginHorizontal: 20, marginBottom: 10,
    },
    sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#1A2E1A' },
    newBadge: {
        backgroundColor: '#FFB82E', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    },
    newBadgeText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#1A2E1A' },

    // Nearby Card
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
    nearbyName: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#1A2E1A' },
    nearbyLocation: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888' },
    nearbyDistance: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#5C7A5C' },

    // Route Card
    routeCard: {
        marginHorizontal: 20, marginTop: 10,
        backgroundColor: '#4A1010', borderRadius: 20, padding: 22,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
    },
    routeCardTop: { marginBottom: 20 },
    routeCardTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#fff', marginBottom: 6 },
    routeCardSub: { fontFamily: 'Nunito-Bold', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    startButton: {
        backgroundColor: '#FFB82E', borderRadius: 30, height: 50,
        justifyContent: 'center', alignItems: 'center',
    },
    startButtonText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#1A2E1A' },
});

export default DriverHome;
