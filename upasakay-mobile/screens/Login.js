import { Ionicons, Octicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { View } from 'react-native';

import {
    ButtonText,
    Colors,
    GoogleLogo,
    InnerContainer,
    LeftIcon,
    Line,
    LineContainer,
    MsgBox,
    OrText,
    PageLogo,
    RightIcon,
    StyledButton,
    StyledContainer,
    StyledFormArea,
    StyledInputLabel,
    StyledTextInput,
} from '../components/styles';

const Login = () => {
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
                    <MsgBox>...</MsgBox>
                    <StyledButton onPress={handleSubmit}>
                        <ButtonText>
                            Login
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
    <Ionicons name="logo-apple" size={20} color={Colors.base_page} /> 
    <ButtonText apple={true}>Sign In with Apple</ButtonText>
</StyledButton>
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

