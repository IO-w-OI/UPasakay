import { Ionicons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useState } from 'react';
import { View } from 'react-native';

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

const Login = () => {
    const router = useRouter(); 
    const [hidePassword, setHidePassword] = useState(true);

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/images/UPasakaySmall.png')} 
/>  

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >{({handleChange, handleBlur, handleSubmit, values}) => <StyledFormArea>
                    <MyTextInput
                        label="Email Address"
                        icon="mail"
                        placeholder="Enter your email address"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                    />
                    <MyTextInput
                        label="Password"
                        icon="lock"
                        placeholder="Enter your password"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={handleChange('password')}
                        secureTextEntry={hidePassword}
                        isPassword={true}
                        hidePassword={hidePassword}
                        setHidePassword={setHidePassword}
                    />
                    <StyledButton onPress={handleSubmit}>
                        <ButtonText>
                            Log In
                        </ButtonText>
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

                            <StyledButton apple={true}>
                                {/* Use Ionicons for the Apple Logo */}
                                <Ionicons name="logo-apple" size={20} color={Colors.white} /> 
                                <ButtonText apple={true}>Log In with Apple</ButtonText>
                            </StyledButton>
                                <ExtraView>
                                    <ExtraText>Don't have an account already? </ExtraText>
                                        <TextLink onPress={() => router.push('/Signup')}> 
                                                <TextLinkContent> Sign up now! </TextLinkContent>
                                        </TextLink>
                                </ExtraView>

                </StyledFormArea>
                }
                </Formik>

            </InnerContainer>
        </StyledContainer>
    );
}

const MyTextInput = ({label, icon, isPassword, hidePassword, setHidePassword, ...props}) => {
    return (
        <View>
            <LeftIcon>
                <Octicons name={icon} size={20} color={Colors.text_idle} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props} />
            {isPassword && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={20} 
                    color={Colors.text_idle} />
                </RightIcon>
            )}
        </View>
    )
}

export default Login;

