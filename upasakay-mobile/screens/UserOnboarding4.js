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

const UserOnboarding4 = () => {
    const router = useRouter();

    const handleStart = () => {
        router.replace('/Users/UserHome');
    };

    return (
        <StyledContainer>
            <InnerContainer style={{ justifyContent: 'center' }}>
                <PageLogo 
                    resizeMode="contain" 
                    source={require('../assets/images/UPasakayBig.png')} 
                    style={{ width: 723 * 0.35, height: 406 * 0.35, marginBottom: 60 }} 
                />

                <ExtraText style={{ 
                    fontFamily: 'Nunito-Bold', // Use the specific bold variant
                    fontSize: 24, 
                    textAlign: 'center', 
                    marginBottom: 40 
                }}>
                    Sign Up Successful!
                </ExtraText>

                <StyledFormArea>
                    <StyledButton onPress={handleStart}>
                        <ButtonText style={{ 
                            fontFamily: 'Nunito-Bold', // Match the Signup button exactly
                            fontSize: 18 // Adjusting slightly to make the Nunito pop
                        }}>
                            Start Booking Now!
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