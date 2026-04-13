import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, View } from 'react-native';

// 1. IMPORT THE SERVICE (Temporary Database)
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
// Defined here so it's recognized by the Login component
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
                    // Inside your Login.tsx Formik onSubmit:
                    onSubmit={(values) => {
                        // 1. REGEX Check first
                        const upEmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;
                        if (!upEmailRegex.test(values.email)) {
                            Alert.alert("Invalid Email", "Please use your official @up.edu.ph email address.");
                            return;
                        }

                        // 2. THE CHECK
                        // This is where the magic happens. We ask UserStore to find a match.
                        const userMatch = validateUser(values.email, values.password);

                        if (userMatch) {
                            // SUCCESS: The array had a match!
                            console.log("Login Success! Name:", userMatch.name);
                            router.replace('/(tabs)/UserHome'); 
                        } else {
                            // FAIL: The email/password didn't exist in the array
                            Alert.alert(
                                "Login Failed", 
                                "We couldn't find an account with that email/password. Sign up now!"
                            );
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