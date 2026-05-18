import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { apiPost } from '../services/apiClient';

const HOME = '/(tabs)/Users/UserHome';

const Feedback = () => {
    const params = useLocalSearchParams();
    const pickupRequestId = params.pickup_request_id ?? params.pickupRequestId;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const goHome = () => router.replace(HOME);

    const submit = async () => {
        if (!pickupRequestId) {
            Alert.alert('Nothing to rate', 'This ride could not be identified.');
            goHome();
            return;
        }
        if (rating < 1) {
            Alert.alert('Pick a rating', 'Tap the stars to rate your ride first.');
            return;
        }

        setSubmitting(true);
        const { ok, data } = await apiPost(
            `pickup-requests/${pickupRequestId}/feedback`,
            { rating, comment: comment.trim() || null }
        );
        setSubmitting(false);

        if (ok) {
            Alert.alert('Thank you!', 'Your feedback helps improve UPasakay.');
            goHome();
        } else {
            Alert.alert('Could not submit', data?.message || 'Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.card}>
                <Ionicons name="bus" size={40} color="#701929" style={{ marginBottom: 8 }} />
                <Text style={styles.title}>How was your ride?</Text>
                <Text style={styles.subtitle}>Your trip is complete. Rate your experience.</Text>

                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <TouchableOpacity
                            key={n}
                            onPress={() => setRating(n)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <Ionicons
                                name={n <= rating ? 'star' : 'star-outline'}
                                size={40}
                                color={n <= rating ? '#FFB82E' : '#C9C9C9'}
                                style={{ marginHorizontal: 4 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Add a comment (optional)"
                    placeholderTextColor="#9aa19a"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    maxLength={1000}
                />

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                    onPress={submit}
                    disabled={submitting}
                    activeOpacity={0.85}
                >
                    {submitting ? (
                        <ActivityIndicator color="#1A2E1A" />
                    ) : (
                        <Text style={styles.submitText}>Submit Feedback</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={goHome} activeOpacity={0.7} disabled={submitting}>
                    <Text style={styles.skipText}>Maybe later</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#701929',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#F4F7F4',
        borderRadius: 28,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A2E1A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#5b665b',
        textAlign: 'center',
        marginBottom: 20,
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 22,
    },
    input: {
        width: '100%',
        minHeight: 90,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1A2E1A',
        padding: 14,
        fontSize: 15,
        color: '#1A2E1A',
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitBtn: {
        width: '100%',
        height: 54,
        backgroundColor: '#FFB82E',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    submitBtnDisabled: {
        opacity: 0.65,
    },
    submitText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A2E1A',
    },
    skipText: {
        fontSize: 14,
        color: '#5b665b',
        textDecorationLine: 'underline',
    },
});

export default Feedback;
