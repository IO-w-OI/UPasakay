import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, View } from 'react-native';

// Import the Service
import { validateUser } from '../services/UserStore';
import { registerForPushNotifications } from '../services/pushNotifications';

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
                    onSubmit={async (values) => {
                        // 1. Domain Validation
                        const upEmailRegex = /^[a-zA-Z0-9._%+-]+@(up\.edu\.ph|upasakay\.com)$/;
                        if (!upEmailRegex.test(values.email)) {
                            Alert.alert("Invalid Email", "Please use @up.edu.ph or @upasakay.com.");
                            return;
                        }

                        // 2. API Call
                        const result = await validateUser(values.email, values.password);

                        if (result.success) {
                            const userName = result.user?.full_name;

                            // Register this device for push (fire-and-forget;
                            // token is now in the session so apiClient can auth).
                            registerForPushNotifications();

                                console.log("---------------- TOKEN RECOVERY ----------------");
                                console.log("YOUR TOKEN IS:", result.user?.token);
                                console.log("------------------------------------------------");

                                console.log("Login Success! Welcome:", userName);


                            // 3. Role-based routing — driven by the backend
                            // auth payload (role: driver | passenger | admin),
                            // not the email domain. Passengers awaiting admin
                            // approval are held on the "Account Under Review"
                            // screen instead of the home screen.
                            if (result.user?.role === 'driver') {
                                console.log("Driver detected. Routing to Driver Dashboard...");
                                router.replace('/(tabs)/Drivers/DriverHome');
                            } else if (!result.user?.approved) {
                                console.log("Passenger pending approval. Routing to Account Under Review...");
                                router.replace('/UserOnboarding4');
                            } else {
                                console.log("Passenger detected. Routing to User Home...");
                                router.replace('/(tabs)/Users/UserHome');
                            }
                        } else {
                            Alert.alert("Login Failed", result.message || "Invalid credentials.");
                        }
                    }}
                >
                    {({handleChange, handleBlur, handleSubmit, values}) => (
                        <StyledFormArea>
                            <MyTextInput
                                icon="mail"
                                placeholder="Enter your email"
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

                            <ExtraView>
                                <TextLink onPress={() => router.push('/ForgotPassword')}>
                                    <TextLinkContent>Forgot password?</TextLinkContent>
                                </TextLink>
                            </ExtraView>

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
                                <ExtraText>Don&apos;t have an account already? </ExtraText>
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