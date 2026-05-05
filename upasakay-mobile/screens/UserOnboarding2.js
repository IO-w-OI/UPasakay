import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import your service and components
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
    
    // Safety: ensure allData is never undefined by using an empty object as fallback
    const allData = useLocalSearchParams() || {}; 
    
    const [department_office, setDept] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Safety: Default to academic list if passenger_type is missing
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

    const handleFinish = async () => {
        if (!department_office) return Alert.alert("Missing Info", "Please select your college or office.");
        if (!allData.email) return Alert.alert("Data Error", "Registration data lost.");

        setIsSubmitting(true); 
        
        console.log("DEBUG - What is in allData?", allData);
        const result = await addUser( 
            allData.full_name,
            allData.email, 
            allData.password, 
            allData.phone, 
            allData.passenger_type, 
            department_office, // Correctly passing the selected college/office
        );
        
        setIsSubmitting(false);

        if (result.success) {
            // Syncing with 'full_name' so the Home screen greeting works immediately
            setCurrentUser({
                full_name: allData.full_name,
                name: allData.full_name, 
                email: allData.email,
                passenger_type: allData.passenger_type,
                department_office: department_office,
            });
            router.replace('/UserOnboarding3');
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
                    <TouchableOpacity onPress={showPicker} activeOpacity={0.8} style={{ marginBottom: 15 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <LeftIcon>
                                <Icon name="university" size={20} color={Colors.text_idle} />
                            </LeftIcon>
                            <StyledTextInput
                                placeholder="Select College/Office"
                                placeholderTextColor={Colors.text_idle}
                                value={department_office}
                                editable={false}
                                pointerEvents="none"
                            />
                        </View>
                    </TouchableOpacity>

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