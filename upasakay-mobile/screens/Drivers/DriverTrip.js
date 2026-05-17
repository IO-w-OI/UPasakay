import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { Pusher } from 'pusher-js/react-native';

import { apiGet, apiPatch } from '../../services/apiClient';
import { useDriverLocationShare } from '../../hooks/useDriverLocationShare';

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY ?? 'f21efd02988d084b7b35';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER ?? 'ap1';

const STATUS_BAR_H = Constants.statusBarHeight;
const MAP_HEIGHT = Math.round(Dimensions.get('window').height * 0.6);

// Leaflet map — all JS lives here, talks back via ReactNativeWebView.postMessage.
// Mirrors the proven UserMap.js setup (no Google Maps key needed; CartoDB tiles).
const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { display: none; }
    .driver-pin {
      background: #C62828;
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 0 6px rgba(198,40,40,0.22), 0 2px 6px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px;
    }
    .stop-count {
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; border: 2.5px solid #fff;
      font-family: sans-serif; font-weight: 800; color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .stop-empty {
      width: 16px; height: 16px;
      background: #9aa59a; border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }
    .stop-next { box-shadow: 0 0 0 6px rgba(46,125,50,0.25), 0 2px 6px rgba(0,0,0,0.35); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([10.3157, 123.8854], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    var driverMarker = null;
    var lastDriver = null;
    window.setDriverLocation = function(lat, lng, pan) {
      lastDriver = [lat, lng];
      var icon = L.divIcon({
        className: '',
        html: '<div class="driver-pin">&#9679;</div>',
        iconSize: [26, 26], iconAnchor: [13, 13],
      });
      if (!driverMarker) {
        driverMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
      } else {
        driverMarker.setLatLng([lat, lng]);
      }
      if (pan) map.setView([lat, lng], 16, { animate: true });
    };

    window.recenter = function() {
      if (lastDriver) { map.setView(lastDriver, 16, { animate: true }); }
      else if (stopMarkers.length > 0) {
        map.fitBounds(L.featureGroup(stopMarkers).getBounds(), { padding: [50, 50] });
      }
    };

    var stopMarkers = [];
    var routeLine = null;

    window.renderStops = function(stops, nextStopId) {
      stopMarkers.forEach(function(m) { map.removeLayer(m); });
      stopMarkers = [];
      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }

      var valid = stops.filter(function(s) { return s.latitude && s.longitude; });
      var latlngs = [];

      valid.forEach(function(stop) {
        var lat = parseFloat(stop.latitude), lng = parseFloat(stop.longitude);
        latlngs.push([lat, lng]);
        var waiting = stop.waiting || 0;
        var isNext = stop.id === nextStopId;
        var html;
        if (waiting > 0) {
          var size = isNext ? 38 : 32;
          var bg = isNext ? '#2E7D32' : '#8D1436';
          var fs = isNext ? 16 : 14;
          html = '<div class="stop-count ' + (isNext ? 'stop-next' : '') +
            '" style="width:' + size + 'px;height:' + size + 'px;background:' + bg +
            ';font-size:' + fs + 'px;">' + waiting + '</div>';
        } else {
          html = '<div class="stop-empty"></div>';
        }
        var icon = L.divIcon({ className: '', html: html, iconSize: [38, 38], iconAnchor: [19, 19] });
        var marker = L.marker([lat, lng], { icon: icon });
        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STOP_TAPPED', id: stop.id }));
          marker.bindPopup(
            '<div style="font-family:sans-serif;min-width:130px">' +
            '<b>' + stop.name + '</b><br>' +
            '<span style="color:#666;font-size:12px">Stop #' + stop.sequence +
            ' &middot; ' + waiting + ' waiting</span></div>'
          ).openPopup();
        });
        marker.addTo(map);
        stopMarkers.push(marker);
      });

      if (latlngs.length >= 2) {
        routeLine = L.polyline(latlngs, { color: '#2E7D32', weight: 4, opacity: 0.65 }).addTo(map);
      }
      if (stopMarkers.length > 0) {
        map.fitBounds(L.featureGroup(stopMarkers).getBounds(), { padding: [50, 50], maxZoom: 16 });
      }
    };

    window.focusStop = function(lat, lng) {
      map.setView([lat, lng], 17, { animate: true });
    };
  </script>
</body>
</html>
`;

const DriverTrip = () => {
    const webRef = useRef(null);
    const pusherRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [feed, setFeed] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [expandedStopId, setExpandedStopId] = useState(null);
    const [actingId, setActingId] = useState(null);

    const { start: startSharing, stop: stopSharing, coords } = useDriverLocationShare();

    const loadFeed = useCallback(async () => {
        setError(null);
        const res = await apiGet('/driver/queue');
        if (res.ok) {
            setFeed(res.data);
        } else {
            setError(res.data?.message || 'Could not load the trip.');
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadFeed();
        startSharing().catch(() => {});
        return () => { stopSharing(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Real-time: refresh queue/counts on new bookings or ride-accepted events.
    useEffect(() => {
        let pusher;
        try {
            pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER, forceTLS: true });
            pusherRef.current = pusher;
            const bookingCh = pusher.subscribe('driver-requests');
            bookingCh.bind('passenger.booked', () => loadFeed());
            const adminCh = pusher.subscribe('admin-rides');
            adminCh.bind('ride.accepted', () => loadFeed());
        } catch (e) {
            console.warn('[Pusher] init error', e);
        }
        return () => {
            try {
                pusherRef.current?.disconnect();
                pusherRef.current = null;
            } catch {}
        };
    }, [loadFeed]);

    const stops = feed?.stops ?? [];
    const queue = feed?.queue ?? [];
    const route = feed?.route;
    const upNext = stops.find((s) => s.waiting > 0);

    // Push stop pins into Leaflet once both the map and the feed are ready.
    useEffect(() => {
        if (!mapLoaded || stops.length === 0) return;
        webRef.current?.injectJavaScript(
            `window.renderStops(${JSON.stringify(stops)}, ${upNext?.id ?? 'null'}); true;`
        );
    }, [mapLoaded, stops, upNext]);

    // Stream the driver's own GPS dot onto the map as it updates.
    useEffect(() => {
        if (!mapLoaded || !coords) return;
        webRef.current?.injectJavaScript(
            `window.setDriverLocation(${coords.latitude}, ${coords.longitude}, false); true;`
        );
    }, [mapLoaded, coords]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFeed();
    }, [loadFeed]);

    const act = useCallback(async (request, kind) => {
        const endpoints = {
            board: `/pickup-requests/${request.id}/board`,
            'no-show': `/pickup-requests/${request.id}/no-show`,
            decline: `/pickup-requests/${request.id}/decline`,
        };
        setActingId(request.id);
        const res = await apiPatch(endpoints[kind], {});
        setActingId(null);
        if (res.ok) {
            await loadFeed();
        } else {
            Alert.alert('Action failed', res.data?.message || 'Please try again.');
        }
    }, [loadFeed]);

    const confirmAction = (request, kind, label) => {
        Alert.alert(
            `${label}?`,
            `${request.passenger} — ${request.pickup_stop ?? 'this stop'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: label,
                    style: kind === 'board' ? 'default' : 'destructive',
                    onPress: () => act(request, kind),
                },
            ]
        );
    };

    const handleMessage = (event) => {
        try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'STOP_TAPPED') {
                setExpandedStopId(msg.id);
            }
        } catch (_) {}
    };

    const passengersAtStop = (stopId) =>
        queue.filter(
            (q) =>
                q.pickup_stop_id === stopId &&
                q.status !== 'cancelled' &&
                q.status !== 'completed'
        );

    return (
        <View style={styles.screen}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#1A2E1A" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{route?.name ?? 'Trip View'}</Text>
                    {route ? (
                        <Text style={styles.headerSub}>
                            {route.start_location} to {route.end_location}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Leaflet map — full width */}
            <View style={styles.mapWrap}>
                <WebView
                    ref={webRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHTML }}
                    style={StyleSheet.absoluteFill}
                    javaScriptEnabled
                    domStorageEnabled
                    onLoad={() => setMapLoaded(true)}
                    onMessage={handleMessage}
                />
                <TouchableOpacity
                    style={styles.recenterBtn}
                    activeOpacity={0.8}
                    onPress={() => webRef.current?.injectJavaScript('window.recenter(); true;')}
                >
                    <Ionicons name="navigate" size={22} color="#1A2E1A" />
                </TouchableOpacity>
            </View>

            {/* Bottom action sheet */}
            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.mutedText}>Loading trip…</Text>
                </View>
            ) : error ? (
                <View style={styles.centerBox}>
                    <Ionicons name="cloud-offline-outline" size={36} color="#C62828" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadFeed}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.sheetContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#2E7D32"
                        />
                    }
                >
                    {/* UP NEXT card */}
                    <View style={styles.upNextCard}>
                        <Text style={styles.upNextLabel}>UP NEXT</Text>
                        <Text style={styles.upNextStop}>
                            {upNext ? upNext.name : 'No passengers waiting'}
                        </Text>
                        {upNext ? (
                            <Text style={styles.upNextMeta}>
                                {upNext.waiting} passenger{upNext.waiting !== 1 ? 's' : ''} waiting
                                {' · Stop '}{upNext.sequence}
                            </Text>
                        ) : (
                            <Text style={styles.upNextMeta}>You&apos;re all caught up.</Text>
                        )}
                    </View>

                    {/* Stop timeline */}
                    {stops.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="bus-outline" size={36} color="#8E8E93" />
                            <Text style={styles.mutedText}>No stops on this route yet.</Text>
                        </View>
                    ) : (
                        stops.map((stop, idx) => {
                            const isOpen = expandedStopId === stop.id;
                            const pax = passengersAtStop(stop.id);
                            const isLast = idx === stops.length - 1;
                            const isNext = upNext?.id === stop.id;
                            return (
                                <View key={stop.id} style={styles.stopRow}>
                                    <View style={styles.timelineCol}>
                                        <View style={[
                                            styles.timelineDot,
                                            isNext && styles.timelineDotActive,
                                        ]}>
                                            <Text style={[
                                                styles.timelineDotText,
                                                isNext && styles.timelineDotTextActive,
                                            ]}>
                                                {stop.sequence}
                                            </Text>
                                        </View>
                                        {!isLast && <View style={styles.timelineLine} />}
                                    </View>

                                    <View style={styles.stopCard}>
                                        <TouchableOpacity
                                            style={styles.stopCardHeader}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setExpandedStopId(isOpen ? null : stop.id);
                                                if (!isOpen && stop.latitude && stop.longitude) {
                                                    webRef.current?.injectJavaScript(
                                                        `window.focusStop(${stop.latitude}, ${stop.longitude}); true;`
                                                    );
                                                }
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.stopName}>{stop.name}</Text>
                                                <Text style={styles.stopMeta}>
                                                    {stop.waiting > 0
                                                        ? `${stop.waiting} passenger${stop.waiting !== 1 ? 's' : ''} waiting`
                                                        : 'No one waiting'}
                                                </Text>
                                            </View>
                                            {stop.waiting > 0 && (
                                                <View style={styles.waitBadge}>
                                                    <Text style={styles.waitBadgeText}>{stop.waiting}</Text>
                                                </View>
                                            )}
                                            <Ionicons
                                                name={isOpen ? 'chevron-up' : 'chevron-down'}
                                                size={18}
                                                color="#5C7A5C"
                                                style={{ marginLeft: 8 }}
                                            />
                                        </TouchableOpacity>

                                        {isOpen && (
                                            <View style={styles.paxList}>
                                                {pax.length === 0 ? (
                                                    <Text style={styles.emptyPax}>
                                                        No active passengers at this stop.
                                                    </Text>
                                                ) : (
                                                    pax.map((p) => (
                                                        <View key={p.id} style={styles.paxRow}>
                                                            <View style={styles.paxInfo}>
                                                                <MaterialCommunityIcons
                                                                    name="account"
                                                                    size={20}
                                                                    color="#1A2E1A"
                                                                />
                                                                <View style={{ marginLeft: 8, flex: 1 }}>
                                                                    <Text style={styles.paxName}>{p.passenger}</Text>
                                                                    <Text style={styles.paxStatus}>
                                                                        {p.status === 'in_progress'
                                                                            ? 'Boarded'
                                                                            : p.status === 'accepted'
                                                                            ? 'Confirmed'
                                                                            : 'Waiting'}
                                                                        {p.dropoff_stop
                                                                            ? ` · to ${p.dropoff_stop}`
                                                                            : ''}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            {p.status !== 'in_progress' && (
                                                                <View style={styles.paxActions}>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionBtn, styles.boardBtn]}
                                                                        disabled={actingId === p.id}
                                                                        onPress={() =>
                                                                            confirmAction(p, 'board', 'Boarded')
                                                                        }
                                                                    >
                                                                        <Ionicons
                                                                            name="checkmark"
                                                                            size={18}
                                                                            color="#fff"
                                                                        />
                                                                        <Text style={styles.actionText}>
                                                                            Boarded
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionBtn, styles.noShowBtn]}
                                                                        disabled={actingId === p.id}
                                                                        onPress={() =>
                                                                            confirmAction(p, 'no-show', 'No-Show')
                                                                        }
                                                                    >
                                                                        <Text style={styles.actionTextDark}>
                                                                            No-Show
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionBtn, styles.declineBtn]}
                                                                        disabled={actingId === p.id}
                                                                        onPress={() =>
                                                                            confirmAction(p, 'decline', 'Decline')
                                                                        }
                                                                    >
                                                                        <Ionicons
                                                                            name="close"
                                                                            size={18}
                                                                            color="#fff"
                                                                        />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    ))
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F2F9F3',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: STATUS_BAR_H + 12,
        paddingBottom: 12,
        paddingHorizontal: 20,
        backgroundColor: '#F2F9F3',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 20, color: '#1A2E1A' },
    headerSub: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#5C7A5C', marginTop: 2 },

    mapWrap: {
        width: '100%',
        height: MAP_HEIGHT,
        backgroundColor: '#dfe7df',
    },
    recenterBtn: {
        position: 'absolute',
        bottom: 14, right: 14,
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.92)',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
    },

    sheetContent: {
        padding: 16,
        paddingBottom: 60,
    },

    upNextCard: {
        marginBottom: 14,
        backgroundColor: '#4A1010', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    upNextLabel: {
        fontFamily: 'Nunito-Bold', fontSize: 11, color: '#FFB82E',
        letterSpacing: 1.5, marginBottom: 4,
    },
    upNextStop: { fontFamily: 'Nunito-Bold', fontSize: 19, color: '#fff', marginBottom: 3 },
    upNextMeta: { fontFamily: 'Nunito-Bold', fontSize: 13, color: 'rgba(255,255,255,0.9)' },

    stopRow: { flexDirection: 'row', marginBottom: 4 },
    timelineCol: { alignItems: 'center', width: 36, marginRight: 10 },
    timelineDot: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#E8F5E9',
        borderWidth: 2, borderColor: '#A5D6A7',
        justifyContent: 'center', alignItems: 'center',
    },
    timelineDotActive: { backgroundColor: '#2E7D32', borderColor: '#1B5E20' },
    timelineDotText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#2E7D32' },
    timelineDotTextActive: { color: '#fff' },
    timelineLine: {
        width: 2, flex: 1, minHeight: 16,
        backgroundColor: '#C8E6C9',
        marginVertical: 4,
    },

    stopCard: {
        flex: 1,
        marginBottom: 8,
        backgroundColor: '#fff', borderRadius: 14,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
        overflow: 'hidden',
    },
    stopCardHeader: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14,
    },
    stopName: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A' },
    stopMeta: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    waitBadge: {
        backgroundColor: '#E8F5E9', borderRadius: 12,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    waitBadgeText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#2E7D32' },

    paxList: {
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
        paddingHorizontal: 14, paddingVertical: 8,
    },
    emptyPax: {
        fontFamily: 'Nunito-Bold', fontSize: 13, color: '#999',
        paddingVertical: 12, textAlign: 'center',
    },
    paxRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    paxInfo: { flexDirection: 'row', alignItems: 'center' },
    paxName: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#1A2E1A' },
    paxStatus: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#888', marginTop: 2 },
    paxActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
        paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12,
    },
    boardBtn: { backgroundColor: '#2E7D32', flex: 1 },
    noShowBtn: { backgroundColor: '#FFE0B2', flex: 1 },
    declineBtn: { backgroundColor: '#C62828', width: 48 },
    actionText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
    actionTextDark: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#8A5A00' },

    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
    mutedText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#888' },
    errorText: {
        fontFamily: 'Nunito-Bold', fontSize: 14, color: '#C62828',
        textAlign: 'center', paddingHorizontal: 20,
    },
    retryBtn: {
        backgroundColor: '#2E7D32', borderRadius: 24,
        paddingHorizontal: 24, paddingVertical: 10,
    },
    retryText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
});

export default DriverTrip;
