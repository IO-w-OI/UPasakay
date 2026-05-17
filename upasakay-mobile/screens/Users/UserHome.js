import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
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
import { currentUser } from '../../services/UserStore';
import { apiGet } from '../../services/apiClient';

const UserHome = () => {
    const router = useRouter();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('api/routes').then(({ ok, data }) => {
            if (ok && Array.isArray(data)) setRoutes(data);
            setLoading(false);
        });
    }, []);

    const handleBusSelection = (route) => {
        if (!route.is_active) return;
        router.push({
            pathname: '/UserBooking',
            params: { busName: route.name, routeId: String(route.id) },
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
                        {currentUser?.full_name ? currentUser.full_name.split(' ')[0] : "User"}
                    </UserName>!
                </Header>

                <SubHeader style={{ marginBottom: 10 }}>
                    Select one of the buses to preview:
                </SubHeader>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.golden_brown} style={{ marginTop: 20 }} />
                ) : (
                    routes.map(route => (
                        <StyledButton
                            key={route.id}
                            onPress={() => handleBusSelection(route)}
                            style={{
                                width: '100%',
                                height: 54,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingHorizontal: 15,
                                ...(route.is_active ? {} : { backgroundColor: Colors.unavailable_idle }),
                            }}
                        >
                            <ButtonText style={{
                                flex: 1,
                                fontSize: 20,
                                textAlign: 'left',
                                color: route.is_active ? Colors.golden_brown : Colors.white,
                                fontFamily: 'Nunito-Bold',
                            }}>
                                {route.name}
                            </ButtonText>
                            {!route.is_active && (
                                <View style={{
                                    backgroundColor: '#555',
                                    borderRadius: 10,
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    alignSelf: 'center',
                                }}>
                                    <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Nunito-Bold' }}>
                                        Unavailable
                                    </Text>
                                </View>
                            )}
                        </StyledButton>
                    ))
                )}
            </BasePage>
        </StyledContainer>
    );
};

export default UserHome;
