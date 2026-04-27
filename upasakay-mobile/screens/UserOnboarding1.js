import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { Octicons } from '@expo/vector-icons';

// Import your exact styled components
import { 
    StyledContainer, 
    InnerContainer, 
    PageLogo, 
    StyledFormArea, 
    StyledTextInput, 
    StyledButton, 
    ButtonText, 
    Colors, 
    LeftIcon 
} from '../components/styles';

const UserOnboarding1 = () => {
    const router = useRouter();
    const prevData = useLocalSearchParams(); // Catch email and password from Signup.js
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState(''); // Empty initially for placeholder effect

    const roles = ['Student', 'Faculty', 'Employee', 'Other'];

    const showPicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', ...roles],
                    cancelButtonIndex: 0,
                    userInterfaceStyle: 'dark',
                },
                (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        setRole(roles[buttonIndex - 1]);
                    }
                }
            );
        } else {
            Alert.alert("Select Role", "", roles.map(r => ({
                text: r, onPress: () => setRole(r)
            })));
        }
    };

    const handleNext = () => {
        if (!name || !phone || !role) {
            return Alert.alert("Missing Info", "Please fill in all fields.");
        }

        // --- ROUTING TO USERONBOARDING2 ---
        // We spread prevData so email/pass are included with the new fields
        router.push({
            pathname: '/UserOnboarding2',
            params: { 
                ...prevData, 
                name: name,
                phone: phone, 
                passenger_type: role.toLowerCase() 
            }
        });
    };

    return (
        <StyledContainer>
            <InnerContainer>
                <PageLogo 
                    resizeMode="contain" 
                    source={require('../assets/images/UPasakayBig.png')} 
                    style={{ width: 723 * 0.35, height: 406 * 0.35, marginBottom: 20 }} 
                />
                
                <StyledFormArea>
                    {/* --- FULL NAME INPUT --- */}
                    <View style={{ marginBottom: 10, justifyContent: 'center' }}>
                        <LeftIcon>
                            <Octicons name="person" size={20} color={Colors.text_idle} />
                        </LeftIcon>
                        <StyledTextInput
                            placeholder="Full Name"
                            placeholderTextColor={Colors.text_idle}
                            onChangeText={setName}
                            value={name}
                        />
                    </View>

                    {/* --- PHONE INPUT --- */}
                    <View style={{ marginBottom: 10, justifyContent: 'center' }}>
                        <LeftIcon>
                            <Octicons name="device-mobile" size={20} color={Colors.text_idle} />
                        </LeftIcon>
                        <StyledTextInput
                            placeholder="Phone Number"
                            placeholderTextColor={Colors.text_idle}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            value={phone}
                        />
                    </View>

                    {/* --- ROLE DROPDOWN --- */}
                    <TouchableOpacity onPress={showPicker} activeOpacity={0.8} style={{ marginBottom: 10 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <LeftIcon>
                                <Octicons name="briefcase" size={20} color={Colors.text_idle} />
                            </LeftIcon>
                            <StyledTextInput
                                placeholder="Select your role"
                                placeholderTextColor={Colors.text_idle}
                                value={role}
                                editable={false} 
                                pointerEvents="none"
                            />
                        </View>
                    </TouchableOpacity>

                    <StyledButton onPress={handleNext}>
                        <ButtonText>Next</ButtonText>
                    </StyledButton>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default UserOnboarding1;