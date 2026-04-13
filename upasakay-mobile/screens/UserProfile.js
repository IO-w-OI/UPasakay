import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Added router for navigation
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native'; // Added Alert

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
} from '../components/styles';

const UserProfile = () => {

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
                    onPress: () => {
                        // 1. You could add AsyncStorage.clear() here later
                        // 2. Redirect to the welcome/login screen
                        router.replace('/'); 
                    } 
                }
            ]
        );
    };

    return (
        <StyledContainer style={{ flex: 1, paddingHorizontal: 0 }} colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <BasePage style={{ flex: 1, paddingHorizontal: 0, alignItems: 'center' }}>
                
                {/* Profile Info */}
                <AvatarContainer>
                    <MaterialCommunityIcons name="account-circle" size={85} color="#1A2E1A" />
                </AvatarContainer>
                
                <UserName>Kyle Dominic D. Olmedo</UserName>
                <UserEmail>kdolmedo@up.edu.ph</UserEmail>
                <UserRole>Student</UserRole>

                {/* My Account Section */}
                <SectionHeader style={{ width: 322 }}>My Account</SectionHeader>
                <SingleMenuItem activeOpacity={0.7}>
                    <IconBox color="#B4DEC0">
                        <Ionicons name="person" size={22} color="#1A2E1A" />
                    </IconBox>
                    <MenuLabel>Edit Profile</MenuLabel>
                    <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                </SingleMenuItem>

                {/* General Section */}
                <SectionHeader style={{ width: 322 }}>General</SectionHeader>
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
        </StyledContainer>
    );
};

export default UserProfile;