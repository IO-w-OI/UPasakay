import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
    StyledContainer,
    InnerContainer,
    PageLogo,
    ExtraText,
    StyledButton,
    ButtonText,
    StyledFormArea
} from '../components/styles';
import { logoutUser } from '../services/UserStore';

const UserOnboarding4 = () => {
    const router = useRouter();

    // Clear the (still-pending) session first; otherwise index.tsx would just
    // redirect a logged-in pending user straight back to this screen.
    const handleReturnToLogin = async () => {
        await logoutUser();
        router.replace('/');
    };

    return (
        <StyledContainer>
            <InnerContainer style={{ justifyContent: 'center' }}>
                <PageLogo
                    resizeMode="contain"
                    source={require('../assets/images/UPasakayBig.png')}
                    style={{ width: 723 * 0.35, height: 406 * 0.35, marginBottom: 40 }}
                />

                <ExtraText style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: 24,
                    textAlign: 'center',
                    marginBottom: 15,
                    color: '#FFB61C',
                }}>
                    Account Under Review
                </ExtraText>

                <View style={{ marginBottom: 40, paddingHorizontal: 20 }}>
                    <ExtraText style={{ fontSize: 16, textAlign: 'center', lineHeight: 26 }}>
                        Thank you for registering! Your account has been submitted to the administration for verification.
                        {"\n\n"}
                        You will receive a notification once your account has been approved.
                    </ExtraText>
                </View>

                <StyledFormArea>
                    <StyledButton
                        onPress={handleReturnToLogin}
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                        <ButtonText style={{ fontFamily: 'Nunito-Bold', fontSize: 18 }}>
                            Return to Login
                        </ButtonText>
                    </StyledButton>
                </StyledFormArea>

                <View style={{ position: 'absolute', bottom: 50 }}>
                    <ExtraText style={{ fontSize: 30, letterSpacing: 5 }}>•••</ExtraText>
                </View>
            </InnerContainer>
        </StyledContainer>
    );
};

export default UserOnboarding4;
