import { Ionicons, Octicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiPatch } from '../services/apiClient';
import { currentUser, setCurrentUser } from '../services/UserStore';
import { Colors } from '../components/styles';
import { moderateScale } from '../utils/responsive';

/* ---- Reusable field components ---- */

const FieldInput = ({ label, iconName, value, onChangeText, placeholder, autoCapitalize, keyboardType }) => (
    <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.inputContainer}>
            <Ionicons name={iconName} size={20} color={Colors.text_idle} style={styles.fieldIcon} />
            <TextInput
                style={styles.field}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.text_idle}
                autoCapitalize={autoCapitalize ?? 'none'}
                keyboardType={keyboardType ?? 'default'}
            />
        </View>
    </View>
);

const PasswordInput = ({ label, value, onChangeText, show, onToggle }) => (
    <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.inputContainer}>
            <Octicons name="lock" size={20} color={Colors.text_idle} style={styles.fieldIcon} />
            <TextInput
                style={[styles.field, { paddingRight: 36 }]}
                value={value}
                onChangeText={onChangeText}
                placeholder="••••••••"
                placeholderTextColor={Colors.text_idle}
                secureTextEntry={!show}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.text_idle} />
            </TouchableOpacity>
        </View>
    </View>
);

/* ---- Main screen ---- */

const EditProfile = () => {
    const [fullName, setFullName] = useState(currentUser?.full_name ?? '');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const trimmed = fullName.trim();

        if (!trimmed) {
            Alert.alert('Required', 'Full name cannot be empty.');
            return;
        }
        if (password && password.length < 8) {
            Alert.alert('Password too short', 'Password must be at least 8 characters.');
            return;
        }
        if (password && password !== passwordConfirm) {
            Alert.alert('Password mismatch', 'Passwords do not match.');
            return;
        }

        const body = { full_name: trimmed };
        if (password) {
            body.password = password;
            body.password_confirmation = passwordConfirm;
        }

        setSaving(true);
        const { ok, data } = await apiPatch('/profile', body);
        setSaving(false);

        if (ok && data?.success) {
            await setCurrentUser({ ...currentUser, full_name: data.data?.full_name ?? trimmed });
            Alert.alert('Saved', 'Profile updated successfully.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } else {
            const errors = data?.errors;
            const firstError = errors ? Object.values(errors)[0]?.[0] : null;
            Alert.alert('Error', firstError ?? data?.message ?? 'Could not update profile. Try again.');
        }
    };

    const roleDisplay = currentUser?.role === 'driver'
        ? 'Driver'
        : currentUser?.passenger_type ?? 'Passenger';

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={26} color="#1A2E1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.body}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar */}
                    <View style={styles.avatarWrap}>
                        <Ionicons name="person-circle" size={moderateScale(90)} color="#1A2E1A" />
                    </View>
                    <Text style={styles.roleLabel}>{roleDisplay}</Text>

                    {/* Full Name */}
                    <FieldInput
                        label="Full Name"
                        iconName="person-outline"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                    />

                    {/* Email — read-only display */}
                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <View style={[styles.inputContainer, styles.inputReadOnly]}>
                            <Ionicons name="mail-outline" size={20} color={Colors.text_idle} style={styles.fieldIcon} />
                            <Text style={[styles.field, { color: Colors.text_idle }]} numberOfLines={1}>
                                {currentUser?.email ?? '—'}
                            </Text>
                        </View>
                    </View>

                    {/* Password section */}
                    <View style={styles.divider} />
                    <Text style={styles.sectionLabel}>Change Password</Text>
                    <Text style={styles.sectionNote}>Leave blank to keep your current password.</Text>

                    <PasswordInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        show={showPassword}
                        onToggle={() => setShowPassword(v => !v)}
                    />
                    <PasswordInput
                        label="Confirm Password"
                        value={passwordConfirm}
                        onChangeText={setPasswordConfirm}
                        show={showConfirm}
                        onToggle={() => setShowConfirm(v => !v)}
                    />

                    {/* Save */}
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={saving}
                    >
                        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.base_page,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.base_page,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E4F0E6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(18),
        color: '#1A2E1A',
    },
    body: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    avatarWrap: {
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    roleLabel: {
        alignSelf: 'center',
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(13),
        color: Colors.text_idle,
        marginBottom: 24,
        textTransform: 'capitalize',
    },
    fieldBlock: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(13),
        color: '#1A2E1A',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D5E8D8',
        paddingHorizontal: 14,
        height: 52,
    },
    inputReadOnly: {
        backgroundColor: '#F0F4F1',
    },
    fieldIcon: {
        marginRight: 10,
    },
    field: {
        flex: 1,
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(15),
        color: '#1A2E1A',
    },
    eyeBtn: {
        position: 'absolute',
        right: 14,
        height: 52,
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#D5E8D8',
        marginVertical: 20,
    },
    sectionLabel: {
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(15),
        color: '#1A2E1A',
        marginBottom: 4,
    },
    sectionNote: {
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(12),
        color: Colors.text_idle,
        marginBottom: 16,
    },
    saveBtn: {
        marginTop: 24,
        backgroundColor: '#1A2E1A',
        borderRadius: 30,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    saveBtnDisabled: {
        opacity: 0.5,
    },
    saveBtnText: {
        fontFamily: 'Nunito-Bold',
        fontSize: moderateScale(16),
        color: '#fff',
    },
});

export default EditProfile;
