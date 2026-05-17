import { Ionicons, Octicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { submitPasswordReset } from '../services/UserStore';

import {
    ButtonText,
    Colors,
    ExtraText,
    ExtraView,
    InnerContainer,
    LeftIcon,
    PageLogo,
    RightIcon,
    StyledButton,
    StyledContainer,
    StyledFormArea,
    StyledInputLabel,
    StyledTextInput,
    TextLink,
    TextLinkContent,
} from '../components/styles';

const Field = ({ label, icon, isPassword, hide, setHide, ...props }) => (
    <View style={{ marginBottom: 7 }}>
        <StyledInputLabel>{label}</StyledInputLabel>
        <View style={{ justifyContent: 'center' }}>
            <LeftIcon>
                <Octicons name={icon} size={20} color={Colors.text_idle} />
            </LeftIcon>
            <StyledTextInput {...props} />
            {isPassword && (
                <RightIcon onPress={() => setHide(!hide)}>
                    <Ionicons name={hide ? 'eye-off' : 'eye'} size={20} color={Colors.text_idle} />
                </RightIcon>
            )}
        </View>
    </View>
);

const ResetPassword = () => {
    const params = useLocalSearchParams();
    const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [hide, setHide] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !code.trim() || !password) {
            Alert.alert('Missing info', 'Enter your email, the code, and a new password.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Passwords do not match', 'Please re-enter the same password.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Weak password', 'Password must be at least 8 characters.');
            return;
        }

        setSubmitting(true);
        const result = await submitPasswordReset(email.trim(), code.trim(), password);
        setSubmitting(false);

        if (result.success) {
            Alert.alert('Password reset', result.message || 'You can now log in with your new password.');
            router.replace('/');
        } else {
            Alert.alert('Reset failed', result.message || 'Invalid or expired code.');
        }
    };

    return (
        <StyledContainer>
            <StatusBar style="light" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/images/UPasakaySmall.png')} />

                <StyledFormArea>
                    <Field
                        label="Account Email"
                        icon="mail"
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={setEmail}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Field
                        label="Reset Code"
                        icon="key"
                        placeholder="6-digit code from your email"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={setCode}
                        value={code}
                        keyboardType="number-pad"
                    />
                    <Field
                        label="New Password"
                        icon="lock"
                        placeholder="Enter a new password"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={hide}
                        isPassword
                        hide={hide}
                        setHide={setHide}
                    />
                    <Field
                        label="Confirm Password"
                        icon="lock"
                        placeholder="Re-enter the new password"
                        placeholderTextColor={Colors.text_idle}
                        onChangeText={setConfirm}
                        value={confirm}
                        secureTextEntry={hide}
                    />

                    <StyledButton onPress={handleSubmit} disabled={submitting}>
                        <ButtonText>{submitting ? 'Resetting…' : 'Reset Password'}</ButtonText>
                    </StyledButton>

                    <ExtraView>
                        <ExtraText>Back to </ExtraText>
                        <TextLink onPress={() => router.replace('/')}>
                            <TextLinkContent> Login </TextLinkContent>
                        </TextLink>
                    </ExtraView>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default ResetPassword;
