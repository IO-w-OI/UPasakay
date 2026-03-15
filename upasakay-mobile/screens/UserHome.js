import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    BasePage,
    ButtonText,
    Colors,
    Header,
    PageLogo,
    StyledButton,
    StyledContainer,
    SubHeader,
} from '../components/styles';

const Home = () => {

    const handleSubmit = () => {
            console.log("Button Pressed!");
            // You can add navigation here later, e.g., router.push('/details');
        };

    return (
        <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <BasePage style={{ padding: 20, alignItems: 'center' }}>
                <PageLogo 
                    resizeMode="contain" 
                    source={require('../assets/images/UPasakayBig.png')} 
                    style={{ 
                        marginTop: 25, // Changed from padding-top to marginTop & camelCase
                        width: 361.5,   // Calculated (723 * 0.5)
                        height: 203     // Calculated (406 * 0.5)
                    }} 
                />
                <Header>
                    Welcome, Jang!
                </Header>
                <SubHeader style={{ marginBottom: 10 }}>
                    Select one of the buses to preview:
                </SubHeader>

                <StyledButton onPress={handleSubmit}
                    style={{width: '100%', height: 54}}
                    >
                    <ButtonText style={{ fontSize:21, color: Colors.golden_brown, fontFamily: 'Nunito-Bold'}}> {/* Adjust 16 to your preferred size */}
                            UPC Cebu City Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton onPress={handleSubmit}
                    style={{width: '100%', height: 54}}>
                    <ButtonText style={{ fontSize: 22 , color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}> {/* Adjust 16 to your preferred size */}  
                        UP Cebu North Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton onPress={handleSubmit}
                    style={{ width: '100%', height: 54}}>
                    <ButtonText style={{ fontSize: 22 , color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}> {/* Adjust 16 to your preferred size */}
                        UP Cebu South Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton 
                    onPress={handleSubmit} 
                    style={{ backgroundColor: Colors.unavailable_idle, width: '100%', height: 54}}
                >
                    <ButtonText style={{ fontSize: 22 , color: Colors.white, fontFamily: 'Nunito-Bold' }}> {/* Adjust 16 to your preferred size */}
                        UPC SRP Bus Route
                    </ButtonText>
                </StyledButton>          

            </BasePage>
        </StyledContainer>
    );
};

export default Home;