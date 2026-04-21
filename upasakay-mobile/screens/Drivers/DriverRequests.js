import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
    BasePage,
    Colors,
    Header,
    StyledContainer,
} from '../../components/styles';

// ─── Initial mock data — swap with Laravel fetch later ──────────────────────
const INITIAL_REQUESTS = [
    { id: 1, name: 'Ben Dela Cruz',   role: 'UP Student', date: '11 Dec 2026, 05:30 PM', status: null },
    { id: 2, name: 'Isabel Ollaban',  role: 'UP Student', date: '11 Dec 2026, 05:30 PM', status: null },
    { id: 3, name: 'Kyle Olmedo',     role: 'UP Student', date: '11 Dec 2026, 05:30 PM', status: null },
    { id: 4, name: 'Jason Bisuela',   role: 'UP Student', date: '11 Dec 2026, 05:30 PM', status: null },
    { id: 5, name: 'Ben Dayagbil',    role: 'UP Student', date: '11 Dec 2026, 05:30 PM', status: null },
    { id: 6, name: 'Ryan Dulaca',     role: 'Teacher',    date: '11 Dec 2026, 05:30 PM', status: null },
    { id: 7, name: 'Demelo Lao',      role: 'Teacher',    date: '11 Dec 2026, 05:30 PM', status: null },
];

const PassengerCard = ({ passenger, onAccept, onDecline }) => {
    const isAccepted  = passenger.status === 'Accepted';
    const isDeclined  = passenger.status === 'Declined';
    const isResolved  = isAccepted || isDeclined;

    return (
        <View style={[styles.card, isResolved && styles.cardResolved]}>
            <View style={styles.cardTop}>
                {/* Avatar */}
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account" size={26} color="#1A2E1A" />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.passengerName}>{passenger.name}</Text>
                    <Text style={styles.passengerRole}>{passenger.role}</Text>
                    <Text style={styles.passengerDate}>{passenger.date}</Text>
                </View>

                {/* Status pill or message icon */}
                {isResolved ? (
                    <View style={[styles.statusPill, isAccepted ? styles.pillAccepted : styles.pillDeclined]}>
                        <Text style={styles.statusText}>{passenger.status}</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.messageIcon} activeOpacity={0.7}>
                        <Ionicons name="chatbubble-outline" size={20} color="#1A2E1A" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom label */}
            <View style={styles.cardBottom}>
                <Text style={styles.bottomLabel}>Makisakay ko Kuya!</Text>
            </View>

            {/* Action buttons — hidden once resolved */}
            {!isResolved && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        activeOpacity={0.75}
                        onPress={() => onDecline(passenger.id)}
                    >
                        <Ionicons name="close" size={26} color="#C62828" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        activeOpacity={0.75}
                        onPress={() => onAccept(passenger.id)}
                    >
                        <Ionicons name="checkmark" size={26} color="#2E7D32" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const DriverRequests = () => {
    const [requests, setRequests] = useState(INITIAL_REQUESTS);

    const handleAccept = (id) => {
        setRequests(prev =>
            prev.map(r => r.id === id ? { ...r, status: 'Accepted' } : r)
        );
    };

    const handleDecline = (id) => {
        setRequests(prev =>
            prev.map(r => r.id === id ? { ...r, status: 'Declined' } : r)
        );
    };

    const pending  = requests.filter(r => r.status === null).length;

    return (
        <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <BasePage style={{ flex: 1, paddingHorizontal: 0 }}>

                <View style={styles.headerRow}>
                    <Header style={{ marginBottom: 0 }}>Passenger Requests</Header>
                    {pending > 0 && (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>{pending}</Text>
                        </View>
                    )}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%' }}
                    contentContainerStyle={{ alignItems: 'center', paddingTop: 12, paddingBottom: 40 }}
                >
                    {requests.map((req) => (
                        <PassengerCard
                            key={req.id}
                            passenger={req}
                            onAccept={handleAccept}
                            onDecline={handleDecline}
                        />
                    ))}
                </ScrollView>
            </BasePage>
        </StyledContainer>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
    },
    pendingBadge: {
        backgroundColor: '#FFB82E', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 3, marginTop: 2,
    },
    pendingBadgeText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#1A2E1A' },

    // Card
    card: {
        width: '90%', backgroundColor: '#fff',
        borderRadius: 18, marginBottom: 14,
        paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    },
    cardResolved: { opacity: 0.85 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },

    // Avatar
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#E8F5E9', justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },

    // Text
    passengerName: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A' },
    passengerRole: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#5C7A5C' },
    passengerDate: { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#aaa', marginTop: 2 },

    // Message icon
    messageIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F0F4F0', justifyContent: 'center', alignItems: 'center',
    },

    // Status Pill
    statusPill: {
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
        alignSelf: 'flex-start',
    },
    pillAccepted: { backgroundColor: '#C8E6C9' },
    pillDeclined: { backgroundColor: '#FFCDD2' },
    statusText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#1A2E1A' },

    // Bottom label
    cardBottom: {
        borderTopWidth: 1, borderTopColor: '#F0F4F0',
        paddingTop: 8, marginBottom: 6,
    },
    bottomLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#C8872A' },

    // Action buttons
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    actionButton: {
        flex: 1, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    declineButton: { backgroundColor: '#FFEBEE' },
    acceptButton:  { backgroundColor: '#E8F5E9' },
});

export default DriverRequests;
