import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, View } from 'react-native';

// Styled Components
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
                        const upEmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;

                        if (!values.email || !values.password) {
                            Alert.alert("Missing Info", "Please fill out all fields.");
                            return;
                        }

                        if (!upEmailRegex.test(values.email)) {
                            Alert.alert("Invalid Email", "Please use your official @up.edu.ph email address.");
                            return;
                        }

                        if (values.password !== values.confirmPassword) {
                            Alert.alert("Error", "Passwords do not match.");
                            return;
                        }

                        // Routing only account credentials to Onboarding 1
                        router.push({
                            pathname: '/UserOnboarding1',
                            params: { 
                                email: values.email,
                                password: values.password
                            }
                        });
                    }}
                >
                    {({handleChange, handleBlur, handleSubmit, values}) => (
                        <StyledFormArea>
                            {/* --- EMAIL INPUT --- */}
                            <MyTextInput
                                icon="mail"
                                placeholder="Enter your email address"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                            />

                            {/* --- PASSWORD INPUT --- */}
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

                            {/* --- CONFIRM PASSWORD INPUT --- */}
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

                            <ExtraView style={{ marginTop: 5 }}>
                                <ExtraSmallText>
                                    By clicking 'Continue', you have read and agreed to our{"\n"}
                                    <TextLinkContent style={{ color: Colors.button_loginsignup }}>Terms of Service</TextLinkContent>
                                    <ExtraSmallText> and </ExtraSmallText>
                                    <TextLinkContent style={{ color: Colors.button_loginsignup }}>Privacy Policy</TextLinkContent>
                                </ExtraSmallText>
                            </ExtraView>

                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>Continue</ButtonText>
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
                                <TextLink onPress={() => router.replace('/Login')}>
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
        <View style={{ marginBottom: 10 }}> 
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