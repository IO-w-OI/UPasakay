import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { apiPost } from '../../services/apiClient';
import { unregisterPushNotifications } from '../../services/pushNotifications';
import { currentUser, logoutUser } from '../../services/UserStore';

import {
    AvatarContainer,
    BasePage,
    Colors,
    IconBox,
    LogOutButton,
    LogOutText,
    MenuGroup,
    MenuItem,
    MenuLabel,
    SectionHeader,
    SingleMenuItem,
    StyledContainer,
    UserEmail,
    UserName,
    UserRole,
} from '../../components/styles';

const DriverProfile = () => {

    const doLogout = async () => {
        // Best-effort server-side cleanup while the token is still valid:
        // stop pushes to this device, then revoke the Sanctum token.
        try { await unregisterPushNotifications(); } catch {}
        try { await apiPost('/logout'); } catch {}
        await logoutUser();          // clears in-memory + SecureStore session
        router.replace('/');
    };

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to log out of UPasakay?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: doLogout,
                },
            ]
        );
    };

    const handleSOS = () => {
        Alert.alert(
            '🚨 Emergency Call',
            'This will contact dispatch and emergency services immediately. Proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call Now',
                    style: 'destructive',
                    onPress: () => console.log('SOS triggered'),
                },
            ]
        );
    };

    return (
        <StyledContainer style={{ flex: 1, paddingHorizontal: 0 }} colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <BasePage style={{ flex: 1, paddingHorizontal: 0 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center', paddingTop: 8, paddingBottom: 130 }}
              >

                {/* Profile Info */}
                <AvatarContainer>
                    <MaterialCommunityIcons name="account-circle" size={85} color="#1A2E1A" />
                </AvatarContainer>

                <UserName>{currentUser?.full_name || 'Driver'}</UserName>
                <UserEmail>{currentUser?.email || '—'}</UserEmail>
                <UserRole>Driver</UserRole>

                {/* My Account */}
                <SectionHeader style={{ width: 322 }}>My Account</SectionHeader>
                <SingleMenuItem activeOpacity={0.7} onPress={() => router.push('/EditProfile')}>
                    <IconBox color="#B4DEC0">
                        <Ionicons name="person" size={22} color="#1A2E1A" />
                    </IconBox>
                    <MenuLabel>Edit Profile</MenuLabel>
                    <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                </SingleMenuItem>

                {/* General */}
                <SectionHeader style={{ width: 322 }}>General</SectionHeader>
                <MenuGroup>
                    <MenuItem activeOpacity={0.7}>
                        <IconBox color="#B4DEC0">
                            <Ionicons name="notifications" size={22} color="#1A2E1A" />
                        </IconBox>
                        <MenuLabel>Notifications</MenuLabel>
                        <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                    </MenuItem>

                    <MenuItem activeOpacity={0.7}>
                        <IconBox color="#B4DEC0">
                            <Ionicons name="map" size={22} color="#1A2E1A" />
                        </IconBox>
                        <MenuLabel>Map Type</MenuLabel>
                        <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                    </MenuItem>

                    <MenuItem last activeOpacity={0.7}>
                        <IconBox color="#B4DEC0">
                            <Ionicons name="settings" size={22} color="#1A2E1A" />
                        </IconBox>
                        <MenuLabel>Settings</MenuLabel>
                        <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                    </MenuItem>
                </MenuGroup>

                {/* Logout */}
                <LogOutButton activeOpacity={0.8} onPress={handleLogout}>
                    <LogOutText>Log Out</LogOutText>
                </LogOutButton>

                {/* SOS Button — driver exclusive */}
                <TouchableOpacity
                    style={styles.sosButton}
                    activeOpacity={0.85}
                    onPress={handleSOS}
                >
                    <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.sosText}>Emergency Call (SOS)</Text>
                </TouchableOpacity>

              </ScrollView>
            </BasePage>
        </StyledContainer>
    );
};

const styles = StyleSheet.create({
    sosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C62828',
        width: 322,
        height: 54,
        borderRadius: 30,
        marginTop: 12,
        marginBottom: 20,
        shadowColor: '#C62828',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    sosText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 17,
        color: '#fff',
    },
});

export default DriverProfile;
