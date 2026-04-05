import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

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

                {/* My Account Section - 322px wide */}
                <SectionHeader style={{ width: 322 }}>My Account</SectionHeader>
                <SingleMenuItem activeOpacity={0.7}>
                    <IconBox color="#B4DEC0">
                        <Ionicons name="person" size={22} color="#1A2E1A" />
                    </IconBox>
                    <MenuLabel>Edit Profile</MenuLabel>
                    <Ionicons name="chevron-forward" size={20} color="#1A2E1A" />
                </SingleMenuItem>

                {/* General Section - 345px wide */}
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

                <LogOutButton activeOpacity={0.8}>
                    <LogOutText>Log Out</LogOutText>
                </LogOutButton>

            </BasePage>
        </StyledContainer>
    );
};

export default UserProfile;