import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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

// ── Filter option sets ──────────────────────────────────────────────────────
const TRIP_STATUS_FILTERS = ['All', 'Completed', 'Cancelled'];
const TRIP_DATE_FILTERS = ['All time', 'This week', 'This month'];
const NOTIF_TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'availability', label: 'Availability' },
  { key: 'delay', label: 'Delays' },
  { key: 'change', label: 'Changes' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'alert', label: 'Alerts' },
];

// Icon per notification type — falls back to a generic bell.
const NOTIF_ICON = {
  availability: 'bus',
  delay: 'time',
  change: 'swap-horizontal',
  announcement: 'megaphone',
  schedule: 'calendar',
  alert: 'alert-circle',
};

// Keep only trips whose ISO timestamp falls inside the chosen window.
const withinDateWindow = (iso, filter) => {
  if (filter === 'All time' || !iso) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  const now = Date.now();
  const days = filter === 'This week' ? 7 : 30;
  return now - t <= days * 24 * 60 * 60 * 1000;
};

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const TripItem = ({ trip, onPress, onParaUlit }) => {
  const isCompleted = trip.status === 'Completed';

  return (
    <TripCard>
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        <CardTop>
          <BusIconContainer>
            <Image
              source={require('../../assets/images/UPasakaySmall.png')}
              style={{ width: 45, height: 45, resizeMode: 'contain' }}
            />
          </BusIconContainer>

          <TripInfo>
            <TripTitle style={{ fontFamily: 'Nunito-Bold', fontSize: moderateScale(14) }}>
              {trip.route}
            </TripTitle>
            <TripTitle style={{ fontFamily: 'Nunito-Bold', fontSize: moderateScale(14) }}>
              {trip.pickup_stop} to {trip.dropoff_stop}
            </TripTitle>
            <TripDate>{trip.date}</TripDate>
          </TripInfo>

          <View style={{ alignItems: 'flex-end' }}>
            <StatusPill completed={isCompleted}>
              <StatusText>{trip.status}</StatusText>
            </StatusPill>
            {isCompleted && trip.rating > 0 && (
              <View style={styles.miniRating}>
                <Ionicons name="star" size={moderateScale(11)} color="#FFB82E" />
                <Text style={styles.miniRatingText}>{trip.rating}</Text>
              </View>
            )}
          </View>
        </CardTop>
      </TouchableOpacity>

      <CardBottom activeOpacity={0.7} onPress={onParaUlit}>
        <ParaUlitText>Para ulit?</ParaUlitText>
      </CardBottom>
    </TripCard>
  );
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
    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
    {badge > 0 && (
      <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
        <Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ── Trip detail modal — feedback + other trips on the same route ────────────
const TripDetailModal = ({ trip, allTrips, visible, onClose, onSelectTrip, onParaUlit }) => {
  if (!trip) return null;
  const isCompleted = trip.status === 'Completed';

  const suggestions = allTrips
    .filter((t) => t.id !== trip.id && t.route_id === trip.route_id)
    .slice(0, 3);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalDim} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalRoute}>{trip.route}</Text>
              <StatusPill completed={isCompleted}>
                <StatusText>{trip.status}</StatusText>
              </StatusPill>
            </View>
            <Text style={styles.modalStops}>{trip.pickup_stop} to {trip.dropoff_stop}</Text>
            <Text style={styles.modalDate}>{trip.date}</Text>

            {/* Feedback section */}
            <Text style={styles.sectionLabel}>Your feedback</Text>
            {isCompleted ? (
              trip.rating > 0 ? (
                <View style={styles.feedbackBox}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={s <= trip.rating ? 'star' : 'star-outline'}
                        size={moderateScale(22)}
                        color={s <= trip.rating ? '#FFB82E' : '#ccc'}
                        style={{ marginRight: 3 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.feedbackComment}>
                    {trip.comment ? `"${trip.comment}"` : 'No comment left.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackMuted}>You didn't rate this trip.</Text>
                </View>
              )
            ) : (
              <View style={[styles.feedbackBox, styles.feedbackBoxCancelled]}>
                <Text style={styles.cancelLabel}>Cancellation reason</Text>
                <Text style={styles.feedbackComment}>
                  {trip.cancel_reason || 'No reason provided.'}
                </Text>
              </View>
            )}

            {/* Suggested — other trips on the same route */}
            {suggestions.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>More on this route</Text>
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.suggestRow}
                    activeOpacity={0.8}
                    onPress={() => onSelectTrip(s)}
                  >
                    <Ionicons
                      name={s.status === 'Completed' ? 'checkmark-circle' : 'close-circle'}
                      size={moderateScale(18)}
                      color={s.status === 'Completed' ? '#55975C' : '#ADADAD'}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.suggestStops} numberOfLines={1}>
                        {s.pickup_stop} to {s.dropoff_stop}
                      </Text>
                      <Text style={styles.suggestDate}>{s.date}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={moderateScale(16)} color="#aaa" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.modalParaBtn}
              activeOpacity={0.85}
              onPress={() => onParaUlit(trip)}
            >
              <Ionicons name="bus" size={moderateScale(18)} color="#1A2E1A" />
              <Text style={styles.modalParaText}>Para ulit — book this route</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const UserRecents = () => {
  const router = useRouter();
  const [tab, setTab] = useState('trips');
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsRefreshing, setTripsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifRefreshing, setNotifRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All time');
  const [notifTypeFilter, setNotifTypeFilter] = useState('all');

  // route_id → currently bookable (driver on duty). Drives "Para ulit".
  const [routeActive, setRouteActive] = useState({});

  // Trip detail modal
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

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

  // Route availability — used to decide whether "Para ulit" can launch a
  // booking (only when a driver is on duty for that route).
  const fetchRoutes = useCallback(async () => {
    const { ok, data } = await apiGet('routes');
    if (ok && Array.isArray(data)) {
      const map = {};
      data.forEach((r) => {
        map[r.id] = r.is_active && r.has_active_driver !== false;
      });
      setRouteActive(map);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchRoutes();
  }, [fetchTrips, fetchRoutes]);

  useEffect(() => {
    if (tab === 'notifications' && notifications.length === 0 && !notifLoading) {
      fetchNotifications();
    }
  }, [tab, notifications.length, notifLoading, fetchNotifications]);

  // ── Derived, filtered lists ───────────────────────────────────────────────
  const filteredTrips = useMemo(
    () =>
      trips.filter(
        (t) =>
          (statusFilter === 'All' || t.status === statusFilter) &&
          withinDateWindow(t.iso, dateFilter)
      ),
    [trips, statusFilter, dateFilter]
  );

  const filteredNotifications = useMemo(
    () =>
      notifTypeFilter === 'all'
        ? notifications
        : notifications.filter((n) => n.type === notifTypeFilter),
    [notifications, notifTypeFilter]
  );

  // ── "Para ulit" — re-book this route if a shuttle is on duty ──────────────
  const handleParaUlit = useCallback(
    (trip) => {
      if (!trip?.route_id) return;
      if (routeActive[trip.route_id]) {
        setDetailVisible(false);
        router.push({
          pathname: '/UserBooking',
          params: { busName: trip.route, routeId: String(trip.route_id) },
        });
      } else {
        Alert.alert(
          'Shuttle offline',
          `No shuttle is currently on duty for the ${trip.route} route. Try again once a driver is online.`
        );
      }
    },
    [routeActive, router]
  );

  const openTrip = (trip) => {
    setSelectedTrip(trip);
    setDetailVisible(true);
  };

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
                label="Notifications"
                badge={tab !== 'notifications' ? notifications.length : 0}
                onPress={() => setTab('notifications')}
              />
            </View>

            {/* Filter chips — switch with the active tab */}
            {tab === 'trips' ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScroll}
                  contentContainerStyle={styles.chipRow}
                >
                  {TRIP_STATUS_FILTERS.map((s) => (
                    <FilterChip
                      key={s}
                      label={s}
                      active={statusFilter === s}
                      onPress={() => setStatusFilter(s)}
                    />
                  ))}
                </ScrollView>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScroll}
                  contentContainerStyle={styles.chipRow}
                >
                  {TRIP_DATE_FILTERS.map((d) => (
                    <FilterChip
                      key={d}
                      label={d}
                      active={dateFilter === d}
                      onPress={() => setDateFilter(d)}
                    />
                  ))}
                </ScrollView>
              </>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                contentContainerStyle={styles.chipRow}
              >
                {NOTIF_TYPE_FILTERS.map((f) => (
                  <FilterChip
                    key={f.key}
                    label={f.label}
                    active={notifTypeFilter === f.key}
                    onPress={() => setNotifTypeFilter(f.key)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {tab === 'trips' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingTop: 12, paddingBottom: NAV_CLEARANCE }}
              refreshControl={
                <RefreshControl
                  refreshing={tripsRefreshing}
                  onRefresh={() => {
                    fetchTrips(true);
                    fetchRoutes();
                  }}
                  tintColor={Colors.golden_brown}
                  colors={[Colors.golden_brown]}
                />
              }
            >
              {tripsLoading ? (
                <ActivityIndicator size="large" color={Colors.golden_brown} style={{ marginTop: 40 }} />
              ) : filteredTrips.length === 0 ? (
                <TripDate style={{ marginTop: 20 }}>
                  {trips.length === 0 ? 'No recent trips found.' : 'No trips match these filters.'}
                </TripDate>
              ) : (
                filteredTrips.map((trip) => (
                  <TripItem
                    key={trip.id}
                    trip={trip}
                    onPress={() => openTrip(trip)}
                    onParaUlit={() => handleParaUlit(trip)}
                  />
                ))
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
              ) : filteredNotifications.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="notifications-off-outline" size={moderateScale(40)} color={Colors.text_idle} />
                  <Text style={styles.emptyTitle}>
                    {notifications.length === 0 ? 'No notifications yet' : 'Nothing in this filter'}
                  </Text>
                  <Text style={styles.emptyBody}>
                    Announcements from the UPasakay team will show up here.
                  </Text>
                </View>
              ) : (
                filteredNotifications.map((n) => <NotificationItem key={n.id} notification={n} />)
              )}
            </ScrollView>
          )}
        </BasePage>
      </SafeAreaView>

      <TripDetailModal
        trip={selectedTrip}
        allTrips={trips}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        onSelectTrip={(t) => setSelectedTrip(t)}
        onParaUlit={handleParaUlit}
      />
    </StyledContainer>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    padding: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: Colors.button_loginsignup,
  },
  tabBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(13),
    color: Colors.text_idle,
  },
  tabBtnTextActive: {
    color: Colors.golden_brown,
  },
  tabBadge: {
    marginLeft: 6,
    minWidth: moderateScale(19),
    height: moderateScale(19),
    paddingHorizontal: 5,
    borderRadius: moderateScale(10),
    backgroundColor: Colors.golden_brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#8B211E',
  },
  tabBadgeText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(10),
  },

  // Filter chips
  chipScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  chipRow: {
    paddingVertical: 3,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  chipActive: {
    backgroundColor: Colors.golden_brown,
    borderColor: Colors.golden_brown,
  },
  chipText: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(12),
    color: Colors.text_idle,
  },
  chipTextActive: {
    color: '#fff',
  },

  // Mini rating on the trip card
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 2,
  },
  miniRatingText: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(11),
    color: Colors.text_active,
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

  // Trip detail modal
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#F4F7F4',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '82%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRoute: {
    flex: 1,
    marginRight: 10,
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(18),
    color: Colors.text_active,
  },
  modalStops: {
    marginTop: 6,
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(14),
    color: Colors.text_active,
  },
  modalDate: {
    marginTop: 2,
    fontFamily: 'Nunito-Regular',
    fontSize: moderateScale(12),
    color: Colors.text_idle,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(12),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.text_idle,
  },
  feedbackBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  feedbackBoxCancelled: {
    backgroundColor: '#fff5f5',
    borderColor: 'rgba(139,33,30,0.25)',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  feedbackComment: {
    fontFamily: 'Nunito-Regular',
    fontSize: moderateScale(13),
    color: Colors.text_active,
    lineHeight: moderateScale(18),
  },
  feedbackMuted: {
    fontFamily: 'Nunito-Regular',
    fontSize: moderateScale(13),
    color: Colors.text_idle,
    fontStyle: 'italic',
  },
  cancelLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(11),
    color: '#8B211E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  suggestStops: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(13),
    color: Colors.text_active,
  },
  suggestDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: moderateScale(11),
    color: Colors.text_idle,
    marginTop: 1,
  },
  modalParaBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFB82E',
    height: moderateScale(50),
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalParaText: {
    fontFamily: 'Nunito-Black',
    fontSize: moderateScale(15),
    color: '#1A2E1A',
  },
});

export default UserRecents;
