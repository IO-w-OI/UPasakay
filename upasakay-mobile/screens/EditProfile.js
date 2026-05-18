import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { moderateScale } from '../utils/responsive';
import { currentUser, updateProfile } from '../services/UserStore';
import { BasePage, Colors, StyledContainer } from '../components/styles';

const EditProfile = () => {
    const [fullName, setFullName] = useState(currentUser?.full_name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [departmentOffice, setDepartmentOffice] = useState(currentUser?.department_office || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim() || !email.trim()) {
            Alert.alert("Missing info", "Full name and email are required.");
            return;
        }

        setSaving(true);
        const result = await updateProfile({
            full_name: fullName.trim(),
            email: email.trim(),
            department_office: departmentOffice.trim(),
        });
        setSaving(false);

        if (result.success) {
            Alert.alert("Saved", result.message, [
                { text: "OK", onPress: () => router.back() },
            ]);
        } else {
            Alert.alert("Update failed", result.message);
        }
    };

    return (
        <StyledContainer style={{ padding: 0 }} colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView contentContainerStyle={{ padding: moderateScale(20) }}>

                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(20) }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
                            <Ionicons name="chevron-back" size={26} color="#1A2E1A" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: moderateScale(20), fontWeight: '700', color: '#1A2E1A', marginLeft: 8 }}>
                            Edit Profile
                        </Text>
                    </View>

                    <Field label="Full Name" value={fullName} onChangeText={setFullName} />
                    <Field
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Field label="Department / Office" value={departmentOffice} onChangeText={setDepartmentOffice} />

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.85}
                        style={{
                            marginTop: moderateScale(20),
                            backgroundColor: '#1A2E1A',
                            paddingVertical: moderateScale(14),
                            borderRadius: 12,
                            alignItems: 'center',
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: moderateScale(15) }}>
                                Save Changes
                            </Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </StyledContainer>
    );
};

const Field = ({ label, ...props }) => (
    <View style={{ marginBottom: moderateScale(14) }}>
        <Text style={{ fontSize: moderateScale(12), color: '#1A2E1A', marginBottom: 6, fontWeight: '600' }}>
            {label}
        </Text>
        <TextInput
            {...props}
            style={{
                borderWidth: 1,
                borderColor: '#B4DEC0',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: '#fff',
                color: '#1A2E1A',
                fontSize: moderateScale(14),
            }}
            placeholderTextColor="#7a8a7a"
        />
    </View>
);

export default EditProfile;