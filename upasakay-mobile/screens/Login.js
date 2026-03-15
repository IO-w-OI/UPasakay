import { Octicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React from 'react';
import { View } from 'react-native';

import {
    Colors,
    InnerContainer,
    LeftIcon,
    PageLogo,
    StyledContainer,
    StyledFormArea,
    StyledInputLabel,
    StyledTextInput
} from '../components/styles';

const Login = () => {
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
                        placeholder="jang@gmail.com"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={handleChange('email')}
                        onblur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                    />
                    <MyTextInput
                        label="Password"
                        icon="lock"
                        placeholder="••••••••"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={handleChange('password')}
                        secureTextEntry={true}
                    />
                </StyledFormArea>
                

                }

                </Formik>

            </InnerContainer>
        </StyledContainer>
    );
}

const MyTextInput = ({label, icon, isPassword, ...props}) => {
    return (
        <View>
            <LeftIcon>
                <Octicons name={icon} size={20} color={Colors.text_idle} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props} />
        </View>
    )
}

export default Login;