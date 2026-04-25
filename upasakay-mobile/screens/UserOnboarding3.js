import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { 
    StyledContainer, 
    InnerContainer, 
    PageLogo, 
    ExtraText, 
    Colors 
} from '../components/styles';

const UserOnboarding3 = () => {
    const router = useRouter();

    useEffect(() => {
        // Simulate "Getting things ready" delay
        const timer = setTimeout(() => {
            router.replace('/UserOnboarding4');
        }, 2500); // 2.5 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <StyledContainer>
            <InnerContainer style={{ justifyContent: 'center' }}>
                <PageLogo 
                    resizeMode="contain" 
                    source={require('../assets/images/UPasakayBig.png')} 
                    style={{ width: 723 * 0.35, height: 406 * 0.35, marginBottom: 60 }} 
                />

                <ExtraText style={{ fontSize: 24, textAlign: 'center', marginBottom: 40, fontFamily: 'Nunito-Bold' }}>
                    Getting things ready!
                </ExtraText>

                {/* Using Native ActivityIndicator for the spinner */}
                <ActivityIndicator size="large" color={Colors.white} />
                
                {/* Your 3-dot progress indicator at the bottom */}
                <View style={{ position: 'absolute', bottom: 50 }}>
                   <ExtraText style={{ fontSize: 30, letterSpacing: 5 }}>•••</ExtraText>
                </View>
            </InnerContainer>
        </StyledContainer>
    );
};

export default UserOnboarding3;