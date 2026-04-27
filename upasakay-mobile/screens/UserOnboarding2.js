import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import your service and components
import { addUser } from '../services/UserStore';
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
    ExtraText // Assuming you have this for the header
} from '../components/styles';

const UserOnboarding2 = () => {
    const router = useRouter();
    const allData = useLocalSearchParams(); // Inherits name, email, pass, phone, passenger_type
    
    const [dept, setDept] = useState('');

    // Filtered lists based on the role selected in Onboarding 1
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

    // Determine which list to show based on the "passenger_type" param
    const options = (allData.passenger_type === 'employee') ? employeeList : academicList;

    const showPicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', ...options],
                    cancelButtonIndex: 0,
                    userInterfaceStyle: 'dark',
                },
                (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        setDept(options[buttonIndex - 1]);
                    }
                }
            );
        } else {
            Alert.alert("Select Affiliation", "", options.map(opt => ({
                text: opt, onPress: () => setDept(opt)
            })));
        }
    };

    const handleFinish = () => {
        if (!dept) return Alert.alert("Missing Info", "Please select your college or office.");

        // FINAL STEP: Save to your temporary database
        const result = addUser(
            allData.name, 
            allData.email, 
            allData.password, 
            allData.phone, 
            allData.passenger_type, 
            dept
        );

        if (result.success) {
            console.log("Signup Complete!");
            router.replace('/UserOnboarding3'); // To the "Success" screen
        } else {
            Alert.alert("Error", result.message);
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
                
                {/* Header text from your screenshot */}
                <View style={{ marginBottom: 30 }}>
                    <ExtraText style={{ fontSize: 28, textAlign: 'center', fontWeight: 'bold' }}>
                        Select your affiliation
                    </ExtraText>
                </View>

                <StyledFormArea>
                    {/* --- DYNAMIC DROPDOWN --- */}
                    <TouchableOpacity onPress={showPicker} activeOpacity={0.8} style={{ marginBottom: 15 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <LeftIcon>
                                <Icon name="university" size={20} color={Colors.text_idle} />
                            </LeftIcon>
                            <StyledTextInput
                                placeholder="Select"
                                placeholderTextColor={Colors.text_idle}
                                value={dept}
                                editable={false}
                                pointerEvents="none"
                            />
                        </View>
                    </TouchableOpacity>

                    <StyledButton onPress={handleFinish} style={{ marginTop: 20 }}>
                        <ButtonText style={{ 
                            fontFamily: 'Nunito-Bold', // Match the Signup button exactly
                            fontSize: 18 // Adjusting slightly to make the Nunito pop
                        }}>
                            Next
                        </ButtonText>
                    </StyledButton>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default UserOnboarding2;