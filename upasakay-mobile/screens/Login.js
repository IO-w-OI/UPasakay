import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, View } from 'react-native';

// Import the Service
import { validateUser } from '../services/UserStore';

import {
    ButtonText,
    Colors,
    ExtraText,
    ExtraView,
    GoogleLogo,
    InnerContainer,
    LeftIcon,
    Line,
    LineContainer,
    OrText,
    PageLogo,
    RightIcon,
    StyledButton,
    StyledContainer,
    StyledFormArea,
    StyledInputLabel,
    StyledTextInput,
    TextLink,
    TextLinkContent
} from '../components/styles';

// --- SUB-COMPONENT: MyTextInput ---
const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
    return (
        <View style={{ marginBottom: 7 }}>
            <StyledInputLabel>{label}</StyledInputLabel>
            <View style={{ justifyContent: 'center' }}> 
                <LeftIcon>
                    <Octicons name={icon} size={20} color={Colors.text_idle} />
                </LeftIcon>
                <StyledTextInput {...props} />
                {isPassword && (
                    <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                        <Ionicons 
                            name={hidePassword ? 'eye-off' : 'eye'} 
                            size={20} 
                            color={Colors.text_idle} 
                        />
                    </RightIcon>
                )}
            </View>
        </View>
    );
};

const Login = () => {
    const router = useRouter(); 
    const [hidePassword, setHidePassword] = useState(true);

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/images/UPasakaySmall.png')} />  

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values) => {
                        // 1. REGEX Check for UP Email
                        const upEmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;
                        if (!upEmailRegex.test(values.email)) {
                            Alert.alert("Invalid Email", "Please use your official @up.edu.ph email address.");
                            return;
                        }

                        // 2. THE CHECK
                        // This calls your updated UserStore logic
                        const result = validateUser(values.email, values.password);

                        if (result.success) {
                            // SUCCESS: Navigate to Home
                            console.log("Login Success! Welcome:", result.user.name);
                            if(result.user.passenger_type === "Driver"){ //If user role is driver, redirect to Driver Home
                                router.replace('/(tabs)/Drivers/DriverHome');
                                console.log("Redirecting to Driver Home...");
                            }
                            else{ //If user role is student, faculty or passenger, redirect to User Home
                                router.replace('/(tabs)/Users/UserHome'); 
                                console.log("Redirecting to User Home...");
                            }
                        } else {
                            // FAIL: Shows either "Account not found" or "Password is invalid"
                            Alert.alert("Login Failed", result.message);
                        }
                    }}
                >
                    {({handleChange, handleBlur, handleSubmit, values}) => (
                        <StyledFormArea>
                            <MyTextInput
                                icon="mail"
                                placeholder="Enter your UP email"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <MyTextInput
                                icon="lock"
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword}
                                value={values.password}
                            />
                            
                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>Log In</ButtonText>
                            </StyledButton>
                            
                            <LineContainer>
                                <Line />
                                <OrText> OR </OrText>
                                <Line />
                            </LineContainer>

                            <StyledButton google={true}>
                                <GoogleLogo source={require('../assets/images/google-logo.png')} /> 
                                <ButtonText google={true}>Log In with Google</ButtonText>
                            </StyledButton>

                            <ExtraView>
                                <ExtraText>Don't have an account already? </ExtraText>
                                <TextLink onPress={() => router.push('/Signup')}> 
                                    <TextLinkContent> Sign up now! </TextLinkContent>
                                </TextLink>
                            </ExtraView>
                        </StyledFormArea>
                    )}
                </Formik>
            </InnerContainer>
        </StyledContainer>
    );
}

export default Login;