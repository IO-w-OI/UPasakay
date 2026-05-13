import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { Octicons } from '@expo/vector-icons';

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
    const prevData = useLocalSearchParams();

    const [full_name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [errors, setErrors] = useState({ full_name: '', phone: '', role: '' });

    const roles = ['Student', 'Faculty', 'Employee', 'Other'];

    const showPicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', ...roles], cancelButtonIndex: 0, userInterfaceStyle: 'dark' },
                (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        setRole(roles[buttonIndex - 1]);
                        setErrors(prev => ({ ...prev, role: '' }));
                    }
                }
            );
        } else {
            Alert.alert("Select Role", "", roles.map(r => ({
                text: r, onPress: () => {
                    setRole(r);
                    setErrors(prev => ({ ...prev, role: '' }));
                }
            })));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!full_name.trim()) newErrors.full_name = 'Full name is required.';
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required.';
        } else if (!phoneRegex.test(phone.trim())) {
            newErrors.phone = 'Enter a valid PH number (e.g., 09xxxxxxxxx).';
        }
        if (!role) newErrors.role = 'Please select your role.';
        setErrors({ full_name: newErrors.full_name || '', phone: newErrors.phone || '', role: newErrors.role || '' });
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validate()) return;
        router.push({
            pathname: '/UserOnboarding2',
            params: { ...prevData, full_name, phone, passenger_type: role.toLowerCase() }
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
                    {/* FULL NAME */}
                    <View style={{ marginBottom: 10 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <LeftIcon>
                                <Octicons name="person" size={20} color={errors.full_name ? '#ef4444' : Colors.text_idle} />
                            </LeftIcon>
                            <StyledTextInput
                                placeholder="Full Name"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={(val) => { setName(val); setErrors(prev => ({ ...prev, full_name: '' })); }}
                                value={full_name}
                                style={errors.full_name ? { borderWidth: 1, borderColor: '#ef4444' } : {}}
                            />
                        </View>
                        {errors.full_name ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.full_name}</Text> : null}
                    </View>

                    {/* PHONE */}
                    <View style={{ marginBottom: 10 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <LeftIcon>
                                <Octicons name="device-mobile" size={20} color={errors.phone ? '#ef4444' : Colors.text_idle} />
                            </LeftIcon>
                            <StyledTextInput
                                placeholder="Phone Number"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={(val) => { setPhone(val); setErrors(prev => ({ ...prev, phone: '' })); }}
                                keyboardType="phone-pad"
                                value={phone}
                                style={errors.phone ? { borderWidth: 1, borderColor: '#ef4444' } : {}}
                            />
                        </View>
                        {errors.phone ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.phone}</Text> : null}
                    </View>

                    {/* ROLE DROPDOWN */}
                    <View style={{ marginBottom: 10 }}>
                        <TouchableOpacity onPress={showPicker} activeOpacity={0.8}>
                            <View style={{ justifyContent: 'center' }}>
                                <LeftIcon>
                                    <Octicons name="briefcase" size={20} color={errors.role ? '#ef4444' : Colors.text_idle} />
                                </LeftIcon>
                                <StyledTextInput
                                    placeholder="Select your role"
                                    placeholderTextColor={Colors.text_idle}
                                    value={role}
                                    editable={false}
                                    pointerEvents="none"
                                    style={errors.role ? { borderWidth: 1, borderColor: '#ef4444' } : {}}
                                />
                            </View>
                        </TouchableOpacity>
                        {errors.role ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.role}</Text> : null}
                    </View>

                    <StyledButton onPress={handleNext} style={{ marginTop: 10 }}>
                        <ButtonText>Next</ButtonText>
                    </StyledButton>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default UserOnboarding1;
