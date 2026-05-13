import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { addUser, setCurrentUser } from '../services/UserStore';
import {
    StyledContainer,
    InnerContainer,
    PageLogo,
    StyledFormArea,
    StyledTextInput,
    StyledButton,
    ButtonText,
    Colors,
    LeftIcon,
    ExtraText
} from '../components/styles';

const UserOnboarding2 = () => {
    const router = useRouter();
    const allData = useLocalSearchParams() || {};

    const [department_office, setDept] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deptError, setDeptError] = useState('');

    const academicList = [
        "College of Communication, Art, and Design",
        "School of Management",
        "College of Science",
        "College of Social Science",
        "UP High School Cebu"
    ];

    const employeeList = [
        "Office of the Chancellor",
        "OVCAA",
        "OVCA",
        "Office of the University Registrar (OUR)",
        "Office of Student Affairs (OSA)",
        "Campus Maintenance Office (CMO)",
        "others"
    ];

    const options = allData.passenger_type === 'employee' ? employeeList : academicList;

    const showPicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', ...options], cancelButtonIndex: 0, userInterfaceStyle: 'dark' },
                (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        setDept(options[buttonIndex - 1]);
                        setDeptError('');
                    }
                }
            );
        } else {
            Alert.alert("Select Affiliation", "", options.map(opt => ({
                text: opt, onPress: () => { setDept(opt); setDeptError(''); }
            })));
        }
    };

    const handleFinish = async () => {
        if (!department_office) {
            setDeptError('Please select your college or office.');
            return;
        }
        if (!allData.email) {
            Alert.alert("Data Error", "Registration data lost. Please go back and try again.");
            return;
        }

        setIsSubmitting(true);
        const result = await addUser(
            allData.full_name,
            allData.email,
            allData.password,
            allData.phone,
            allData.passenger_type,
            department_office,
        );
        setIsSubmitting(false);

        if (result.success) {
            setCurrentUser({
                full_name: allData.full_name,
                name: allData.full_name,
                email: allData.email,
                passenger_type: allData.passenger_type,
                department_office: department_office,
            });
            // Skip the fake loading screen and go straight to the pending approval screen
            router.replace('/UserOnboarding4');
        } else {
            Alert.alert("Registration Failed", result.message);
        }
    };

    return (
        <StyledContainer>
            <InnerContainer>
                <PageLogo
                    resizeMode="contain"
                    source={require('../assets/images/UPasakayBig.png')}
                    style={{ width: 723 * 0.35, height: 406 * 0.35, marginBottom: 40 }}
                />

                <View style={{ marginBottom: 30 }}>
                    <ExtraText style={{ fontSize: 28, textAlign: 'center', fontWeight: 'bold' }}>
                        Select your affiliation
                    </ExtraText>
                </View>

                <StyledFormArea>
                    <View style={{ marginBottom: 15 }}>
                        <TouchableOpacity onPress={showPicker} activeOpacity={0.8}>
                            <View style={{ justifyContent: 'center' }}>
                                <LeftIcon>
                                    <Icon name="university" size={20} color={deptError ? '#ef4444' : Colors.text_idle} />
                                </LeftIcon>
                                <StyledTextInput
                                    placeholder="Select College/Office"
                                    placeholderTextColor={Colors.text_idle}
                                    value={department_office}
                                    editable={false}
                                    pointerEvents="none"
                                    style={deptError ? { borderWidth: 1, borderColor: '#ef4444' } : {}}
                                />
                            </View>
                        </TouchableOpacity>
                        {deptError ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{deptError}</Text> : null}
                    </View>

                    <StyledButton
                        onPress={handleFinish}
                        disabled={isSubmitting}
                        style={{ marginTop: 20, opacity: isSubmitting ? 0.5 : 1 }}
                    >
                        <ButtonText style={{ fontFamily: 'Nunito-Bold', fontSize: 18 }}>
                            {isSubmitting ? "Registering..." : "Finish Setup"}
                        </ButtonText>
                    </StyledButton>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default UserOnboarding2;
