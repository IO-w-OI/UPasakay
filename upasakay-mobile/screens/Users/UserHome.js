import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, StyledContainer } from '../../components/styles';
import { useTrip } from '../../context/TripContext';
import { apiGet } from '../../services/apiClient';
import { currentUser } from '../../services/UserStore';
import { moderateScale, NAV_CLEARANCE, scale } from '../../utils/responsive';

// A route is bookable when the admin hasn't disabled it AND a driver is
// currently on duty (PickupRequestService rejects bookings otherwise, so
// surfacing this here avoids walking the passenger into a dead-end).
const isRouteBookable = (route) => route.is_active && route.has_active_driver !== false;

const RouteCard = ({ route, onPress }) => {
    const bookable = isRouteBookable(route);
    // Distinguish admin-disabled vs no-driver so the label is honest.
    const unavailableLabel = !route.is_active ? 'Route closed' : 'No driver on duty';

    return (
        <TouchableOpacity
            activeOpacity={bookable ? 0.85 : 1}
            disabled={!bookable}
            onPress={onPress}
            style={[styles.card, !bookable && styles.cardDisabled]}
            accessibilityState={{ disabled: !bookable }}
            accessibilityHint={bookable ? undefined : unavailableLabel}
        >
            <View style={styles.busIconWrap}>
                <Image
                    source={require('../../assets/images/UPasakaySmall.png')}
                    style={styles.busIcon}
                    resizeMode="contain"
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={[styles.routeName, !bookable && styles.routeNameDisabled]} numberOfLines={2}>
                    {route.name}
                </Text>
                {!bookable && (
                    <Text style={styles.unavailableHint}>{unavailableLabel}</Text>
                )}
            </View>

            {bookable ? (
                <Ionicons name="chevron-forward" size={moderateScale(20)} color={Colors.golden_brown} />
            ) : (
                <View style={styles.pill}>
                    <Text style={styles.pillText}>{!route.is_active ? 'Closed' : 'No driver'}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const UserHome = () => {
    const router = useRouter();
    const { refreshActiveBooking } = useTrip();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [firstName, setFirstName] = useState(
        currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'User'
    );

    const fetchRoutes = useCallback(async (isPullRefresh = false) => {
        if (isPullRefresh) setRefreshing(true);
        const { ok, data } = await apiGet('routes');
        if (ok && Array.isArray(data)) setRoutes(data);
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

    // Whenever this tab regains focus: refresh routes + 30s poll, and check
    // for an in-flight pickup request. If one exists, redirect into the
    // locked booking screen so the passenger can't start a parallel ride.
    useFocusEffect(useCallback(() => {
        setFirstName(currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'User');
        fetchRoutes();

        let cancelled = false;
        refreshActiveBooking().then((data) => {
            if (cancelled || !data?.pickup_request) return;
            const pr = data.pickup_request;
            router.replace({
                pathname: '/UserBooking',
                params: {
                    busName: pr.route?.name ?? '',
                    routeId: String(pr.route_id),
                },
            });
        });

        const intervalId = setInterval(() => fetchRoutes(), 30000);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [fetchRoutes, refreshActiveBooking, router]));

    const handleBusSelection = (route) => {
        if (!isRouteBookable(route)) return;
        router.push({
            pathname: '/UserBooking',
            params: { busName: route.name, routeId: String(route.id) },
        });
    };

    return (
        <StyledContainer style={{ padding: 0, paddingTop: 0 }} colors={[Colors.base_page, Colors.base_page]}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: NAV_CLEARANCE }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchRoutes(true)}
                            tintColor={Colors.golden_brown}
                            colors={[Colors.golden_brown]}
                        />
                    }
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
    unavailableHint: {
        marginTop: 2,
        fontSize: moderateScale(11),
        fontFamily: 'Nunito-Bold',
        color: 'rgba(255,255,255,0.85)',
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
