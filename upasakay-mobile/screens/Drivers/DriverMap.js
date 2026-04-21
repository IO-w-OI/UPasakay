import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

const STOPS = [
    { id: 1, name: 'Talamban Terminal',   eta: 'Departed' },
    { id: 2, name: 'Jollibee (Guadalupe)', eta: '2 min' },
    { id: 3, name: 'AS Gate 2',            eta: '5 min' },
    { id: 4, name: 'Gaisano Country Mall', eta: '9 min' },
    { id: 5, name: 'UP Cebu Main Gate',    eta: '14 min' },
];

const DriverMap = () => {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(1); // 0-indexed next stop
    const paxOnBoard = 12;
    const stopsLeft   = STOPS.length - currentStopIndex - 1;

    const recenter = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow location access to use the map.');
            return;
        }
        let curr = await Location.getCurrentPositionAsync({});
        setLocation(curr);
        mapRef.current?.animateToRegion({
            latitude:      curr.coords.latitude,
            longitude:     curr.coords.longitude,
            latitudeDelta:  0.01,
            longitudeDelta: 0.01,
        }, 1000);
    };

    useEffect(() => { recenter(); }, []);

    const handleArrived = () => {
        if (currentStopIndex < STOPS.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
        }
    };

    const nextStop = STOPS[currentStopIndex];

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude:      10.3157,
                    longitude:     123.8854,
                    latitudeDelta:  0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
            />

            {/* ── Route Status Pill ── */}
            <View style={styles.routePillWrapper}>
                <View style={styles.routePill}>
                    <View style={styles.greenDot} />
                    <Text style={styles.routePillText}>South Bound</Text>
                </View>
                <Text style={styles.routeSubText}>
                    On route · {paxOnBoard} pax on board · {stopsLeft} stop{stopsLeft !== 1 ? 's' : ''} left
                </Text>
            </View>

            {/* ── Recenter Button ── */}
            <TouchableOpacity
                style={styles.recenterButtonWrapper}
                onPress={recenter}
                activeOpacity={0.8}
            >
                <BlurView intensity={90} tint="light" style={styles.glassButton}>
                    <Ionicons
                        name="navigate"
                        size={28}
                        color="#1A2E1A"
                        style={Platform.select({
                            ios:     { transform: [{ translateX: -2 }, { translateY: -1.5 }] },
                            android: { transform: [{ translateX: -2 }, { translateY: -1.5 }] },
                        })}
                    />
                </BlurView>
            </TouchableOpacity>

            {/* ── Next Stop Card ── */}
            <BlurView intensity={90} tint="light" style={styles.stopCard}>
                {/* Stop Info */}
                <View style={styles.stopRow}>
                    <View style={styles.stopIconBox}>
                        <Ionicons name="location" size={20} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.stopLabel}>Next Stop</Text>
                        <Text style={styles.stopName}>{nextStop.name}</Text>
                    </View>
                    <View style={styles.etaBadge}>
                        <Text style={styles.etaText}>{nextStop.eta}</Text>
                    </View>
                </View>

                {/* Arrived Button */}
                <TouchableOpacity
                    style={[styles.arrivedButton, currentStopIndex >= STOPS.length - 1 && styles.arrivedButtonDone]}
                    activeOpacity={0.8}
                    onPress={handleArrived}
                    disabled={currentStopIndex >= STOPS.length - 1}
                >
                    <Text style={styles.arrivedText}>
                        {currentStopIndex >= STOPS.length - 1 ? 'Route Complete ✓' : 'Arrived at Stop'}
                    </Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map:       { flex: 1 },

    // Route Pill
    routePillWrapper: {
        position: 'absolute', top: 60, alignSelf: 'center',
        alignItems: 'center', zIndex: 10,
    },
    routePill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#2E7D32', borderRadius: 30,
        paddingHorizontal: 18, paddingVertical: 8,
        marginBottom: 6,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
    },
    greenDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A5D6A7', marginRight: 8 },
    routePillText: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#fff' },
    routeSubText: {
        fontFamily: 'Nunito-Bold', fontSize: 12, color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 4,
    },

    // Recenter
    recenterButtonWrapper: {
        position: 'absolute', bottom: 200, right: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
    },
    glassButton: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(212,230,213,0.65)',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
    },

    // Stop Card
    stopCard: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 24, paddingBottom: 40,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        backgroundColor: '#F2F9F3',
        overflow: 'hidden',
        borderWidth: 1, borderColor: '#3e5141',
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
    },
    stopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    stopIconBox: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#2E7D32', justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },
    stopLabel: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888' },
    stopName:  { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#1A2E1A' },
    etaBadge: {
        backgroundColor: '#FFB82E', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    etaText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#1A2E1A' },

    // Arrived Button
    arrivedButton: {
        backgroundColor: '#1A2E1A', height: 56, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
    },
    arrivedButtonDone: { backgroundColor: '#2E7D32' },
    arrivedText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#fff' },
});

export default DriverMap;
