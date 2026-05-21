import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BasePage,
  BusIconContainer,
  CardBottom,
  CardTop,
  Colors,
  Header,
  ParaUlitText,
  StatusPill,
  StatusText,
  StyledContainer,
  TripCard,
  TripDate,
  TripInfo,
  TripTitle,
} from '../../components/styles';
import { apiGet } from '../../services/apiClient';
import { moderateScale, NAV_CLEARANCE } from '../../utils/responsive';

const TripItem = ({ status, route, pickup_stop, dropoff_stop, date }) => {
  const isCompleted = status === 'Completed';

  return (
    <TripCard>
      <CardTop>
        <BusIconContainer>
          <Image
            source={require('../../assets/images/UPasakaySmall.png')}
            style={{ width: 45, height: 45, resizeMode: 'contain' }}
          />
        </BusIconContainer>

        <TripInfo>
          <TripTitle style={{ fontFamily: 'Nunito-Bold', fontSize: moderateScale(14) }}>{route}</TripTitle>
          <TripTitle style={{ fontFamily: 'Nunito-Bold', fontSize: moderateScale(14) }}>{pickup_stop} → {dropoff_stop}</TripTitle>
          <TripDate>{date}</TripDate>
        </TripInfo>

        <View style={{ alignItems: 'flex-end' }}>
          <StatusPill completed={isCompleted}>
            <StatusText>{status}</StatusText>
          </StatusPill>
        </View>
      </CardTop>

      <CardBottom activeOpacity={0.7}>
        <ParaUlitText>Para ulit?</ParaUlitText>
      </CardBottom>
    </TripCard>
  );
};

// Icon per notification type — falls back to a generic bell.
const NOTIF_ICON = {
  availability: 'bus',
  delay: 'time',
  change: 'swap-horizontal',
  announcement: 'megaphone',
  schedule: 'calendar',
  alert: 'alert-circle',
};

const NotificationItem = ({ notification }) => {
  const iconName = NOTIF_ICON[notification.type] ?? 'notifications';

  return (
    <View style={styles.notifCard}>
      <View style={styles.notifIconWrap}>
        <Ionicons name={iconName} size={moderateScale(20)} color={Colors.golden_brown} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.notifTime}>{notification.date} · {notification.time}</Text>
        </View>
        {!!notification.type_label && (
          <Text style={styles.notifTag}>{notification.type_label}</Text>
        )}
        <Text style={styles.notifMessage}>{notification.message}</Text>
      </View>
    </View>
  );
};

const TabButton = ({ active, label, badge, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.tabBtn, active && styles.tabBtnActive]}
  >
    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]} numberOfLines={1}>{label}</Text>
    {badge > 0 && (
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const UserRecents = () => {
  const [tab, setTab] = useState('trips');
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsRefreshing, setTripsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifRefreshing, setNotifRefreshing] = useState(false);

  const fetchTrips = useCallback(async (isPull = false) => {
    if (isPull) setTripsRefreshing(true);
    else setTripsLoading(true);
    const { ok, data } = await apiGet('passenger/trips');
    if (ok) setTrips(Array.isArray(data?.data) ? data.data : []);
    setTripsLoading(false);
    setTripsRefreshing(false);
  }, []);

  const fetchNotifications = useCallback(async (isPull = false) => {
    if (isPull) setNotifRefreshing(true);
    else setNotifLoading(true);
    const { ok, data } = await apiGet('passenger/notifications');
    if (ok) setNotifications(Array.isArray(data?.data) ? data.data : []);
    setNotifLoading(false);
    setNotifRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (tab === 'notifications' && notifications.length === 0 && !notifLoading) {
      fetchNotifications();
    }
  }, [tab, notifications.length, notifLoading, fetchNotifications]);

  return (
    <StyledContainer style={{ padding: 0, paddingTop: 0 }} colors={[Colors.base_page, Colors.base_page]}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <BasePage style={{ flex: 1, paddingHorizontal: 0 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <Header>Recents</Header>

            <View style={styles.tabs}>
              <TabButton
                active={tab === 'trips'}
                label="Trips"
                onPress={() => setTab('trips')}
              />
              <TabButton
                active={tab === 'notifications'}
                label="Notifs"
                badge={tab !== 'notifications' ? notifications.length : 0}
                onPress={() => setTab('notifications')}
              />
            </View>
          </View>

          {tab === 'trips' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingTop: 12, paddingBottom: NAV_CLEARANCE }}
              refreshControl={
                <RefreshControl
                  refreshing={tripsRefreshing}
                  onRefresh={() => fetchTrips(true)}
                  tintColor={Colors.golden_brown}
                  colors={[Colors.golden_brown]}
                />
              }
            >
              {tripsLoading ? (
                <ActivityIndicator size="large" color={Colors.golden_brown} style={{ marginTop: 40 }} />
              ) : trips.length === 0 ? (
                <TripDate style={{ marginTop: 20 }}>No recent trips found.</TripDate>
              ) : (
                trips.map((trip) => <TripItem key={trip.id} {...trip} />)
              )}
            </ScrollView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width: '100%' }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: NAV_CLEARANCE }}
              refreshControl={
                <RefreshControl
                  refreshing={notifRefreshing}
                  onRefresh={() => fetchNotifications(true)}
                  tintColor={Colors.golden_brown}
                  colors={[Colors.golden_brown]}
                />
              }
            >
              {notifLoading ? (
                <ActivityIndicator size="large" color={Colors.golden_brown} style={{ marginTop: 40 }} />
              ) : notifications.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="notifications-off-outline" size={moderateScale(40)} color={Colors.text_idle} />
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptyBody}>
                    Announcements from the UPasakay team will show up here.
                  </Text>
                </View>
              ) : (
                notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
              )}
            </ScrollView>
          )}
        </BasePage>
      </SafeAreaView>
    </StyledContainer>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    padding: 4,
    marginTop: 10,
    marginBottom: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: Colors.button_loginsignup,
  },
  tabBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(13),
    color: Colors.text_idle,
    flexShrink: 1,
  },
  tabBtnTextActive: {
    color: Colors.golden_brown,
  },
  tabBadge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: Colors.golden_brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(10),
  },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(122,74,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(14),
    color: Colors.text_active,
  },
  notifTime: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(11),
    color: Colors.text_idle,
  },
  notifTag: {
    marginTop: 2,
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(11),
    color: Colors.golden_brown,
  },
  notifMessage: {
    marginTop: 4,
    fontSize: moderateScale(13),
    color: Colors.text_active,
    lineHeight: moderateScale(18),
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(16),
    color: Colors.text_active,
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: moderateScale(13),
    color: Colors.text_idle,
  },
});

export default UserRecents;
