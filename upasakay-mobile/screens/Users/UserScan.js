import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { apiPost } from '../../services/apiClient';

export default function UserScan() {
    const { requestId } = useLocalSearchParams();
    const [permission, requestPermission] = useCameraPermissions();

    // expo-camera fires onBarcodeScanned many times/sec. The ref locks out
    // duplicate submits synchronously (state lags the callback); it is
    // cleared only after the request resolves on failure (on success we
    // leave the screen).
    const processingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [locked, setLocked] = useState(false);
    const [manualCode, setManualCode] = useState('');

    const submitCode = async (rawCode) => {
        const code = (rawCode ?? '').trim();
        if (!code) {
            Alert.alert('Enter a code', 'Type the code printed on the shuttle, or scan its QR.');
            return;
        }
        if (processingRef.current) return;
        processingRef.current = true;
        setLocked(true);
        setSubmitting(true);

        // GPS proximity is enforced server-side; we just attach our location.
        let coords = null;
        try {
            const perm = await Location.requestForegroundPermissionsAsync();
            if (perm.status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                coords = loc.coords;
            }
        } catch {
            coords = null;
        }

        if (!coords) {
            setSubmitting(false);
            processingRef.current = false;
            setLocked(false);
            Alert.alert(
                'Location needed',
                'Turn on location so we can confirm you are on the shuttle, then try again.',
            );
            return;
        }

        const res = await apiPost(`/pickup-requests/${requestId}/confirm-boarding`, {
            code,
            latitude: coords.latitude,
            longitude: coords.longitude,
        });

        setSubmitting(false);

        if (res.ok) {
            Alert.alert('Boarded ✓', "You're on board. Enjoy your ride!", [
                { text: 'OK', onPress: () => router.back() },
            ]);
            return;
        }

        Alert.alert('Could not confirm', res.data?.message || 'Please try again.');
        // Re-arm so the passenger can retry.
        processingRef.current = false;
        setLocked(false);
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar style="light" />

            {permission.granted ? (
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={locked ? undefined : ({ data }) => submitCode(data)}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, styles.noCam]} />
            )}

            <View style={styles.overlay} pointerEvents="box-none">
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>

                {permission.granted ? (
                    <>
                        <View style={styles.reticle} />
                        <Text style={styles.hint}>
                            {submitting ? 'Confirming…' : 'Scan the QR code on the shuttle'}
                        </Text>
                    </>
                ) : (
                    <View style={styles.permBox}>
                        <Ionicons name="camera-outline" size={40} color="#fff" />
                        <Text style={styles.permText}>
                            Allow camera access to scan, or enter the code below.
                        </Text>
                        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                            <Text style={styles.permBtnText}>Enable camera</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.manualBox}>
                    <Text style={styles.manualLabel}>Or enter the code on the shuttle</Text>
                    <View style={styles.manualRow}>
                        <TextInput
                            style={styles.input}
                            value={manualCode}
                            onChangeText={setManualCode}
                            placeholder="e.g. K7P2QX"
                            placeholderTextColor="#aaa"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            editable={!submitting}
                        />
                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                            disabled={submitting}
                            onPress={() => submitCode(manualCode)}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#1A2E1A" />
                            ) : (
                                <Text style={styles.submitText}>Board</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: {
        flex: 1,
        backgroundColor: '#1A2E1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noCam: { backgroundColor: '#1A2E1A' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
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
        width: 230,
        height: 230,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#FFB82E',
        backgroundColor: 'transparent',
    },
    hint: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        marginTop: 22,
        textAlign: 'center',
    },
    permBox: { alignItems: 'center' },
    permText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Nunito-Regular',
        textAlign: 'center',
        marginVertical: 14,
    },
    permBtn: {
        backgroundColor: '#FFB82E',
        paddingHorizontal: 24,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permBtnText: { fontSize: 15, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
    manualBox: {
        position: 'absolute',
        bottom: 48,
        left: 24,
        right: 24,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 18,
        padding: 16,
    },
    manualLabel: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Nunito-Regular',
        marginBottom: 8,
    },
    manualRow: { flexDirection: 'row', gap: 10 },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        fontSize: 18,
        letterSpacing: 2,
        fontFamily: 'Nunito-Bold',
        color: '#1A2E1A',
    },
    submitBtn: {
        backgroundColor: '#FFB82E',
        borderRadius: 12,
        paddingHorizontal: 20,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitText: { fontSize: 16, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
});
