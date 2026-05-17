import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { apiPost } from '../../services/apiClient';

export default function DriverScan() {
    const { requestId, passenger } = useLocalSearchParams();
    const [permission, requestPermission] = useCameraPermissions();

    // expo-camera fires onBarcodeScanned many times/sec. The ref locks out
    // duplicate POSTs synchronously (state updates lag the callback); it is
    // cleared only after the request resolves on failure (on success we leave
    // the screen, so no reset is needed).
    const processingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [scanned, setScanned] = useState(false);

    const handleScan = async ({ data }) => {
        if (processingRef.current) return;
        processingRef.current = true;
        setScanned(true);
        setSubmitting(true);

        const res = await apiPost(`/pickup-requests/${requestId}/confirm-boarding`, {
            code: data,
        });

        setSubmitting(false);

        if (res.ok) {
            Alert.alert(
                'Boarded ✓',
                `${passenger ?? 'Passenger'} is now on board.`,
                [{ text: 'OK', onPress: () => router.back() }],
            );
            return;
        }

        Alert.alert('Scan failed', res.data?.message || 'Invalid code. Try again.');
        // Re-arm the scanner so the driver can try again.
        processingRef.current = false;
        setScanned(false);
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Ionicons name="camera-outline" size={48} color="#fff" />
                <Text style={styles.permText}>
                    Camera access is needed to scan boarding QR codes.
                </Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Grant access</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                    <Text style={styles.backLinkText}>Go back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleScan}
            />

            <View style={styles.overlay} pointerEvents="box-none">
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>

                <View style={styles.reticle} />

                <Text style={styles.hint}>
                    {submitting
                        ? 'Confirming…'
                        : `Scan ${passenger ?? 'the passenger'}'s QR code`}
                </Text>

                {submitting ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: 16 }} />
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: {
        flex: 1,
        backgroundColor: '#1A2E1A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reticle: {
        width: 240,
        height: 240,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#FFB82E',
        backgroundColor: 'transparent',
    },
    hint: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        marginTop: 24,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    permText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        textAlign: 'center',
        marginVertical: 16,
    },
    permBtn: {
        backgroundColor: '#FFB82E',
        paddingHorizontal: 28,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permBtnText: { fontSize: 16, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
    backLink: { marginTop: 18 },
    backLinkText: { color: '#fff', fontSize: 15, fontFamily: 'Nunito-Regular' },
});
