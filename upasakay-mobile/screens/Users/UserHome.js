import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, StyledContainer } from '../../components/styles';
import { currentUser } from '../../services/UserStore';
import { moderateScale, NAV_CLEARANCE, scale } from '../../utils/responsive';

const ROUTES = [
    { name: 'UPC Cebu City Bus Route', id: 'CEBU_CITY_01', available: true },
    { name: 'UP Cebu North Bus Route', id: 'NORTH_02', available: true },
    { name: 'UP Cebu South Bus Route', id: 'SOUTH_03', available: true },
    { name: 'UPC SRP Bus Route', id: 'SRP_04', available: false },
];

const RouteCard = ({ route, onPress }) => (
    <TouchableOpacity
        activeOpacity={route.available ? 0.85 : 1}
        disabled={!route.available}
        onPress={onPress}
        style={[styles.card, !route.available && styles.cardDisabled]}
    >
        <View style={styles.busIconWrap}>
            <Image
                source={require('../../assets/images/UPasakaySmall.png')}
                style={styles.busIcon}
                resizeMode="contain"
            />
        </View>

        <Text style={[styles.routeName, !route.available && styles.routeNameDisabled]} numberOfLines={2}>
            {route.name}
        </Text>

        {route.available ? (
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

    const handleBusSelection = (busName, busId) => {
        router.push({ pathname: '/UserBooking', params: { busName, busId } });
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

                    {ROUTES.map((route) => (
                        <RouteCard
                            key={route.id}
                            route={route}
                            onPress={() => handleBusSelection(route.name, route.id)}
                        />
                    ))}
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
