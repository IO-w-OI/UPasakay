import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, StyledContainer } from '../../components/styles';
import { apiGet } from '../../services/apiClient';
import { currentUser } from '../../services/UserStore';
import { moderateScale, NAV_CLEARANCE, scale } from '../../utils/responsive';

const RouteCard = ({ route, onPress }) => (
    <TouchableOpacity
        activeOpacity={route.is_active ? 0.85 : 1}
        disabled={!route.is_active}
        onPress={onPress}
        style={[styles.card, !route.is_active && styles.cardDisabled]}
    >
        <View style={styles.busIconWrap}>
            <Image
                source={require('../../assets/images/UPasakaySmall.png')}
                style={styles.busIcon}
                resizeMode="contain"
            />
        </View>

        <Text style={[styles.routeName, !route.is_active && styles.routeNameDisabled]} numberOfLines={2}>
            {route.name}
        </Text>

        {route.is_active ? (
            <Ionicons name="chevron-forward" size={moderateScale(20)} color={Colors.golden_brown} />
        ) : (
            <View style={styles.pill}>
                <Text style={styles.pillText}>Unavailable</Text>
            </View>
        )}
    </TouchableOpacity>
);

const UserHome = () => {
    const router = useRouter();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet('routes').then(({ ok, data }) => {
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

    const firstName = currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'User';

    return (
        <StyledContainer style={{ padding: 0, paddingTop: 0 }} colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: NAV_CLEARANCE }}
                >
                    <Image
                        source={require('../../assets/images/UPasakayBig.png')}
                        resizeMode="contain"
                        style={styles.logo}
                    />

                    <Text style={styles.welcome}>
                        Welcome, <Text style={styles.welcomeName}>{firstName}</Text>!
                    </Text>
                    <Text style={styles.subtitle}>Select one of the buses to preview:</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.golden_brown} style={{ marginTop: 20 }} />
                    ) : (
                        routes.map((route) => (
                            <RouteCard
                                key={route.id}
                                route={route}
                                onPress={() => handleBusSelection(route)}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </StyledContainer>
    );
};

const styles = StyleSheet.create({
    logo: {
        width: moderateScale(220),
        height: moderateScale(124),
        alignSelf: 'center',
        marginTop: moderateScale(8),
    },
    welcome: {
        fontSize: moderateScale(28),
        fontFamily: 'Nunito-Bold',
        color: Colors.text_active,
        marginTop: moderateScale(4),
    },
    welcomeName: {
        color: '#1A2E1A',
    },
    subtitle: {
        fontSize: moderateScale(17),
        fontFamily: 'Nunito-Bold',
        color: Colors.text_active,
        marginTop: 6,
        marginBottom: moderateScale(14),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.button_loginsignup,
        borderRadius: 18,
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(16),
        marginBottom: moderateScale(14),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
    },
    cardDisabled: {
        backgroundColor: Colors.unavailable_idle,
    },
    busIconWrap: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(22),
        backgroundColor: 'rgba(255,255,255,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(14),
    },
    busIcon: {
        width: moderateScale(30),
        height: moderateScale(30),
    },
    routeName: {
        flex: 1,
        fontSize: moderateScale(18),
        fontFamily: 'Nunito-Bold',
        color: Colors.golden_brown,
    },
    routeNameDisabled: {
        color: Colors.white,
    },
    pill: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    pillText: {
        color: Colors.white,
        fontSize: moderateScale(11),
        fontFamily: 'Nunito-Bold',
    },
});

export default UserHome;
