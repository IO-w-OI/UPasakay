import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { moderateScale, NAV_CLEARANCE } from '../../utils/responsive';

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

const UserProfile = () => {
    const [user, setUser] = useState(currentUser);

    // Re-read currentUser every time this tab comes back into focus
    // (e.g. after returning from EditProfile).
    useFocusEffect(useCallback(() => {
        setUser({ ...currentUser });
    }, []));

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to log out of UPasakay?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        // Clear the in-memory + persisted session FIRST, otherwise
                        // app/index.tsx still sees currentUser.token and bounces
                        // straight back to Home.
                        await logoutUser();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    return (
        <StyledContainer style={{ padding: 0, paddingTop: 0 }} colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: NAV_CLEARANCE }}
            >
            <BasePage style={{ flex: 0, paddingHorizontal: 0, paddingTop: moderateScale(20), alignItems: 'center' }}>

                {/* Profile Info */}
                <AvatarContainer>
                    <MaterialCommunityIcons name="account-circle" size={moderateScale(82)} color="#1A2E1A" />
                </AvatarContainer>
                
                {/* 2. REFERENCE DYNAMIC DATA */}
                {/* We use ?. to prevent crashing if currentUser is temporarily null */}
                <UserName>{user?.full_name || "User Name"}</UserName>
                <UserEmail>{user?.email || "email@up.edu.ph"}</UserEmail>
                <UserRole>{user?.passenger_type || "Passenger Type"}</UserRole>
                {/*<UserRole>{currentUser?.department || currentUser?.department_office || "Affiliation"} </UserRole>*/}
                {/*i'll fix this later bc im tired*/}

                {/* My Account Section */}
                <SectionHeader>My Account</SectionHeader>
                <SingleMenuItem activeOpacity={0.7} onPress={() => router.push('/EditProfile')}>
                    <IconBox color="#B4DEC0">
                        <Ionicons name="person" size={22} color="#1A2E1A" />
                    </IconBox>
                    <MenuLabel>Edit Profile</MenuLabel>
                    <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                </SingleMenuItem>

                {/* General Section */}
                <SectionHeader>General</SectionHeader>
                <MenuGroup>
                    <MenuItem activeOpacity={0.7}>
                        <IconBox color="#B4DEC0">
                            <MaterialCommunityIcons name="shield-check" size={22} color="#1A2E1A" />
                        </IconBox>
                        <MenuLabel>Privacy and Policy</MenuLabel>
                        <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                    </MenuItem>
                    
                    <MenuItem activeOpacity={0.7}>
                        <IconBox color="#B4DEC0">
                            <Ionicons name="document-text" size={22} color="#1A2E1A" />
                        </IconBox>
                        <MenuLabel>Terms and Conditions</MenuLabel>
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

                {/* Connected Logout Button */}
                <LogOutButton activeOpacity={0.8} onPress={handleLogout}>
                    <LogOutText>Log Out</LogOutText>
                </LogOutButton>

            </BasePage>
            </ScrollView>
            </SafeAreaView>
        </StyledContainer>
    );
};

export default UserProfile;