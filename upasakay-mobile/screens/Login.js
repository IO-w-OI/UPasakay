import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';

// Import the Service
import { validateUser, googleSignIn } from '../services/UserStore';
import { registerForPushNotifications } from '../services/pushNotifications';

import {
    ButtonText,
    Colors,
    ExtraText,
    ExtraView,
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

const routeAfterAuth = (user, router) => {
    if (user?.role === 'driver') {
        router.replace('/(tabs)/Drivers/DriverHome');
    } else if (!user?.approved) {
        router.replace('/UserOnboarding4');
    } else {
        router.replace('/(tabs)/Users/UserHome');
    }
};

const Login = () => {
    const router = useRouter();
    const [hidePassword, setHidePassword] = useState(true);

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;
            if (!idToken) {
                Alert.alert('Google Sign-In Failed', 'No ID token received.');
                return;
            }
            const result = await googleSignIn(idToken);
            if (result.success) {
                registerForPushNotifications();
                routeAfterAuth(result.user, router);
            } else if (result.code === 'account_not_found') {
                Alert.alert(
                    'No Account Found',
                    `No UPasakay account is linked to ${result.googleEmail}.\n\nWould you like to sign up?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Sign Up',
                            onPress: () => router.push({
                                pathname: '/Signup',
                                params: {
                                    prefill_email: result.googleEmail,
                                    prefill_name: result.googleName,
                                },
                            }),
                        },
                    ]
                );
            } else {
                Alert.alert('Sign-In Failed', result.message || 'Google sign-in failed.');
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
            if (error.code === statusCodes.IN_PROGRESS) return;
            Alert.alert('Google Sign-In Error', error.message || 'Something went wrong.');
        }
    };

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/images/UPasakaySmall.png')} />  

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={async (values) => {
                        const result = await validateUser(values.email, values.password);

                        if (result.success) {
                            registerForPushNotifications();
                            routeAfterAuth(result.user, router);
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

                            <LineContainer>
                                <Line />
                                <OrText> OR </OrText>
                                <Line />
                            </LineContainer>

                            <StyledButton
                                onPress={handleGoogleSignIn}
                                style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                                <Image
                                    source={require('../assets/images/google-logo.png')}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="contain"
                                />
                                <ButtonText style={{ color: '#333' }}>Log In with Google</ButtonText>
                            </StyledButton>

                            <ExtraView>
                                <TextLink onPress={() => router.push('/ForgotPassword')}>
                                    <TextLinkContent>Forgot password?</TextLinkContent>
                                </TextLink>
                            </ExtraView>

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