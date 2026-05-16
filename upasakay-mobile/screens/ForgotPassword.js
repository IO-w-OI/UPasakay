import { Octicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { requestPasswordReset } from '../services/UserStore';

import {
    ButtonText,
    Colors,
    ExtraText,
    ExtraView,
    InnerContainer,
    LeftIcon,
    PageLogo,
    StyledButton,
    StyledContainer,
    StyledFormArea,
    StyledInputLabel,
    StyledTextInput,
    TextLink,
    TextLinkContent,
} from '../components/styles';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Email required', 'Please enter your account email.');
            return;
        }

        setSubmitting(true);
        const result = await requestPasswordReset(email.trim());
        setSubmitting(false);

        // Always generic (no account enumeration) — move to the next step.
        Alert.alert('Check your email', result.message || 'If that email is registered, a reset code has been sent.');
        router.push({ pathname: '/ResetPassword', params: { email: email.trim() } });
    };

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/images/UPasakaySmall.png')} />

                <StyledFormArea>
                    <View style={{ marginBottom: 7 }}>
                        <StyledInputLabel>Account Email</StyledInputLabel>
                        <View style={{ justifyContent: 'center' }}>
                            <LeftIcon>
                                <Octicons name="mail" size={20} color={Colors.text_idle} />
                            </LeftIcon>
                            <StyledTextInput
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.text_idle}
                                onChangeText={setEmail}
                                value={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <StyledButton onPress={handleSubmit} disabled={submitting}>
                        <ButtonText>{submitting ? 'Sending…' : 'Send Reset Code'}</ButtonText>
                    </StyledButton>

                    <ExtraView>
                        <ExtraText>Remembered it? </ExtraText>
                        <TextLink onPress={() => router.replace('/')}>
                            <TextLinkContent> Back to Login </TextLinkContent>
                        </TextLink>
                    </ExtraView>

                    <ExtraView>
                        <ExtraText>Already have a code? </ExtraText>
                        <TextLink onPress={() => router.push({ pathname: '/ResetPassword', params: { email: email.trim() } })}>
                            <TextLinkContent> Enter it here </TextLinkContent>
                        </TextLink>
                    </ExtraView>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default ForgotPassword;
