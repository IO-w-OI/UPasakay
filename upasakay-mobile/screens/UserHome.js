import { StatusBar } from 'expo-status-bar';
import {
    BasePage,
    ButtonText,
    Colors,
    Header,
    PageLogo,
    StyledButton,
    StyledContainer,
    SubHeader,
    UserName,
} from '../components/styles';

//database
import { currentUser } from '../services/UserStore';

const UserHome = () => {

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
                        marginTop: 5, // Changed from padding-top to marginTop & camelCase
                        width: (723*0.5),   // Calculated (723 * 0.5)
                        height: (406*0.5)     // Calculated (406 * 0.5)
                    }} 
                />
                <Header>
                    Welcome, <UserName style={{ fontSize: 30 }}>
                        {currentUser?.name ? currentUser.name.split(' ')[0] : "User"}
                    </UserName>!
                </Header>
                <SubHeader style={{ marginBottom: 10 }}>
                    Select one of the buses to preview:
                </SubHeader>

                <StyledButton onPress={handleSubmit}
                    style={{width: '100%', height: 54}}
                    >
                    <ButtonText style={{ fontSize:20, color: Colors.golden_brown, fontFamily: 'Nunito-Bold'}}> {/* Adjust 16 to your preferred size */}
                            UPC Cebu City Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton onPress={handleSubmit}
                    style={{width: '100%', height: 54}}>
                    <ButtonText style={{ fontSize: 20 , color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}> {/* Adjust 16 to your preferred size */}  
                        UP Cebu North Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton onPress={handleSubmit}
                    style={{ width: '100%', height: 54}}>
                    <ButtonText style={{ fontSize: 20 , color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}> {/* Adjust 16 to your preferred size */}
                        UP Cebu South Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton 
                    onPress={handleSubmit} 
                    style={{ backgroundColor: Colors.unavailable_idle, width: '100%', height: 54}}
                >
                    <ButtonText style={{ fontSize: 20 , color: Colors.white, fontFamily: 'Nunito-Bold' }}> {/* Adjust 16 to your preferred size */}
                        UPC SRP Bus Route
                    </ButtonText>
                </StyledButton>          

            </BasePage>
        </StyledContainer>
    );
};

export default UserHome;