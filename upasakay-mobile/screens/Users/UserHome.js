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
} from '../../components/styles';
import { useRouter } from 'expo-router';

// database
import { currentUser } from '../../services/UserStore';

import * as Notifications from 'expo-notifications';

const UserHome = () => {
    const router = useRouter();

    const handleTestNotify = async () => {
        console.log("Attempting to trigger notification..."); 
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "UPasakay 🚌",
                body: "You pressed the notification button. I work!",
                sound: true,
            },
            trigger: null,
        });
    };

    // 1. Updated handleSubmit to accept bus details
    const handleBusSelection = (busName, busId) => {
        router.push({
            pathname: '/UserBooking',
            params: { 
                busName: busName, 
                busId: busId 
            }
        });
    };

    return (
        <StyledContainer colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <BasePage style={{ padding: 20, alignItems: 'center' }}>
                <PageLogo 
                    resizeMode="contain" 
                    source={require('../../assets/images/UPasakayBig.png')} 
                    style={{ 
                        marginTop: 5,
                        width: (723 * 0.5),
                        height: (406 * 0.5)
                    }} 
                />
                
                <Header>
                    Welcome, <UserName style={{ fontSize: 30 }}>
                        {/* * SAFETY CHECK: 
                          * Uses optional chaining (?.) and a fallback "User" 
                          * to prevent the "undefined" crash during login transition.
                        */}
                        {currentUser?.full_name ? currentUser.full_name.split(' ')[0] : "User"}
                    </UserName>!
                </Header>

                <SubHeader style={{ marginBottom: 10 }}>
                    Select one of the buses to preview:
                </SubHeader>

                {/* 2. Passing specific details for each button */}
                <StyledButton 
                    onPress={() => handleBusSelection('UPC Cebu City Bus Route', 'CEBU_CITY_01')}
                    style={{width: '100%', height: 54}}
                >
                    <ButtonText style={{ fontSize: 20, color: Colors.golden_brown, fontFamily: 'Nunito-Bold'}}>
                        UPC Cebu City Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton 
                    onPress={() => handleBusSelection('UP Cebu North Bus Route', 'NORTH_02')}
                    style={{width: '100%', height: 54}}
                >
                    <ButtonText style={{ fontSize: 20, color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}>
                        UP Cebu North Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton 
                    onPress={() => handleBusSelection('UP Cebu South Bus Route', 'SOUTH_03')}
                    style={{ width: '100%', height: 54}}
                >
                    <ButtonText style={{ fontSize: 20, color: Colors.golden_brown, fontFamily: 'Nunito-Bold' }}>
                        UP Cebu South Bus Route
                    </ButtonText>
                </StyledButton>

                <StyledButton 
                    onPress={() => handleBusSelection('UPC SRP Bus Route', 'SRP_04')} 
                    style={{ backgroundColor: Colors.unavailable_idle, width: '100%', height: 54}}
                >
                    <ButtonText style={{ fontSize: 20, color: Colors.white, fontFamily: 'Nunito-Bold' }}>
                        UPC SRP Bus Route
                    </ButtonText>
                </StyledButton>   

                <StyledButton onPress={handleTestNotify} style={{ marginTop: 10 }}>
                    <ButtonText style={{ fontWeight: 'bold' }}>Test Notification</ButtonText>
                </StyledButton>       

            </BasePage>
        </StyledContainer>
    );
};

export default UserHome;