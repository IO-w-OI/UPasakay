import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import {
    ButtonText,
    Colors,
    ExtraSmallText,
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
    SmallTextLinkContent,
    StyledButton,
    StyledContainer,
    StyledFormArea,
    StyledInputLabel,
    StyledTextInput,
    TextLink,
    TextLinkContent
} from '../components/styles';

const Signup = () => {
    const router = useRouter();
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <InnerContainer>
                <PageLogo 
                    resizeMode="contain" 
                    source={require('../assets/images/UPasakayBig.png')} 
                    style={{ 
                        width: 723 * 0.35, 
                        height: 406 * 0.35 
                    }} 
                />

                <Formik
                    initialValues={{ email: '', password: '', confirmPassword: '' }}
                    onSubmit={(values) => {
                        // 1. TEST CREDENTIALS (Matches Login for fast testing)
                        const TEST_USER = "domdom@up.edu.ph";
                        const TEST_PASS = "admin123";

                        // Bypass to Tabs if using test account
                        if (values.email === TEST_USER && values.password === TEST_PASS) {
                            console.log("Test Signup Successful! Entering Tabs...");
                            router.replace('/(tabs)/UserHome'); 
                            return;
                        }

                        // 2. VALIDATION LOGIC
                        const upEmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;

                        if (!upEmailRegex.test(values.email)) {
                            Alert.alert("Invalid Email", "Please use your official @up.edu.ph email address.");
                            return;
                        }

                        if (values.password !== values.confirmPassword) {
                            Alert.alert("Error", "Passwords do not match.");
                            return;
                        }

                        // 3. SUCCESS (For non-test accounts)
                        console.log("Form Proceeding:", values);
                        Alert.alert("Success", "Account created! Redirecting to Login.");
                        router.replace('/Login');
                    }}
                >
                    {({handleChange, handleBlur, handleSubmit, values}) => (
                        <StyledFormArea>
                            <MyTextInput
                                icon="mail"
                                placeholder="Enter your email address"
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
                                value={values.password}
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword}
                            />
                            <MyTextInput
                                icon="lock"
                                placeholder="Confirm your password"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                value={values.confirmPassword}
                                secureTextEntry={hideConfirmPassword} 
                                isPassword={true}
                                hidePassword={hideConfirmPassword}    
                                setHidePassword={setHideConfirmPassword} 
                            />

                            <ExtraView>
                                <ExtraSmallText>
                                    By clicking 'Sign Up', you have read and agreed to our{"\n"}
                                    <ExtraSmallText 
                                        style={{ fontWeight: 'regular', color: Colors.button_loginsignup }} 
                                        onPress={() => Alert.alert("Legal", "Terms of Service coming soon!")}
                                    >
                                        <SmallTextLinkContent>Terms of Service</SmallTextLinkContent>
                                    </ExtraSmallText>
                                    <ExtraSmallText> and </ExtraSmallText>
                                    <ExtraSmallText 
                                        style={{ fontWeight: 'regular', color: Colors.button_loginsignup }} 
                                        onPress={() => Alert.alert("Legal", "Privacy Policy coming soon!")}
                                    >
                                        <SmallTextLinkContent>Privacy Policy</SmallTextLinkContent>
                                    </ExtraSmallText>
                                </ExtraSmallText>
                            </ExtraView>

                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>Sign Up</ButtonText>
                            </StyledButton>

                            <LineContainer>
                                <Line />
                                <OrText> OR </OrText>
                                <Line />
                            </LineContainer>

                            <StyledButton google={true}>
                                <GoogleLogo source={require('../assets/images/google-logo.png')} /> 
                                <ButtonText google={true}>Sign Up with Google</ButtonText>
                            </StyledButton>
                            
                            <ExtraView>
                                <ExtraText>Already have an account? </ExtraText>
                                <TextLink onPress={() => router.back()}> 
                                    <TextLinkContent>Log In</TextLinkContent>
                                </TextLink>
                            </ExtraView>
                        </StyledFormArea>
                    )}
                </Formik>
            </InnerContainer>
        </StyledContainer>
    );
}

const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
    return (
        <View style={{ marginBottom: 5 }}>
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

export default Signup;