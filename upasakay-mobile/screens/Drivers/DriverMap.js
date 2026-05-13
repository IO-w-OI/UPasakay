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
    const [currentStopIndex, setCurrentStopIndex] = useState(1); 
    const paxOnBoard = 12;
    const stopsLeft = STOPS.length - currentStopIndex - 1;

    // ─── AGGRESSIVE TRACKING & LOGGING ───
    useEffect(() => {
        let subscription;

        const startTracking = async () => {
            console.log("🛠️ DRIVER_TRACKING: Initializing...");

            // Use Foreground Only to prevent Info.plist errors in Expo Go
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log("📜 Foreground Permission Status:", status);

            if (status !== 'granted') {
                console.log("❌ Permission Denied by user");
                Alert.alert('Permission Denied', 'Please allow location access to share bus coordinates.');
                return;
            }

            console.log("📡 Starting Aggressive watchPositionAsync...");
            
            // This is what will spam your terminal with logs
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    distanceInterval: 0, // LOG EVERY MICROMETER
                    timeInterval: 1000,   // EVERY SECOND
                },
                (newLocation) => {
                    const { latitude, longitude, speed } = newLocation.coords;
                    
                    // THE CONSOLE LOG PAYLOAD
                    console.log(`📍 DRIVER_POS: [${latitude.toFixed(6)}, ${longitude.toFixed(6)}] | Speed: ${(speed * 3.6).toFixed(1)} km/h`);
                    
                    setLocation(newLocation);
                }
            );
        };

        startTracking();

        return () => {
            if (subscription) {
                console.log("🛑 TRACKING_STOPPED: Cleaning up subscription.");
                subscription.remove();
            }
        };
    }, []);

    const recenter = async () => {
        if (!location) return;
        mapRef.current?.animateToRegion({
            latitude:      location.coords.latitude,
            longitude:     location.coords.longitude,
            latitudeDelta:  0.008,
            longitudeDelta: 0.008,
        }, 1000);
    };

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
                    latitude:      10.3381,
                    longitude:     123.9116,
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
                    <Ionicons name="navigate" size={28} color="#1A2E1A" />
                </BlurView>
            </TouchableOpacity>

            {/* ── Next Stop Card ── */}
            <BlurView intensity={95} tint="light" style={styles.stopCard}>
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

    routePillWrapper: {
        position: 'absolute', top: 60, alignSelf: 'center',
        alignItems: 'center', zIndex: 10,
    },
    routePill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#014421', borderRadius: 30, // Official UP Green
        paddingHorizontal: 18, paddingVertical: 8,
        marginBottom: 6,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
    },
    greenDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A5D6A7', marginRight: 8 },
    routePillText: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#fff' },
    routeSubText: {
        fontFamily: 'Nunito-Bold', fontSize: 12, color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 4,
    },

    recenterButtonWrapper: {
        position: 'absolute', bottom: 210, right: 20,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
    },
    glassButton: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },

    stopCard: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 50 : 35,
        borderTopLeftRadius: 35, borderTopRightRadius: 35,
        backgroundColor: 'rgba(242, 249, 243, 0.95)',
        overflow: 'hidden',
        borderWidth: 1.5, borderColor: '#014421',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
    },
    stopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    stopIconBox: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#014421', justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },
    stopLabel: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#666' },
    stopName:  { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#1A2E1A' },
    etaBadge: {
        backgroundColor: '#FFB82E', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    etaText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#1A2E1A' },

    arrivedButton: {
        backgroundColor: '#1A2E1A', height: 56, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
    },
    arrivedButtonDone: { backgroundColor: '#014421' },
    arrivedText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#fff' },
});

export default DriverMap;