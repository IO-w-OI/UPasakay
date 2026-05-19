import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Pusher } from 'pusher-js/react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { apiGet, apiPost } from '../../services/apiClient';
import { moderateScale, scale } from '../../utils/responsive';

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY ?? 'f21efd02988d084b7b35';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER ?? 'ap1';
const SHUTTLE_POLL_MS = 8000;

const ROUTE_COLORS = { north: '#3b82f6', south: '#22c55e', 'cebu city': '#f97316' };
const getRouteColor = (name = '') => {
  const n = name.toLowerCase();
  for (const [k, c] of Object.entries(ROUTE_COLORS)) {
    if (n.includes(k)) return c;
  }
  return '#f97316';
};

// Leaflet map HTML — all JS lives here and communicates back via ReactNativeWebView.postMessage
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
    .user-pin {
      background: #2563eb;
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 0 6px rgba(37,99,235,0.25), 0 2px 6px rgba(0,0,0,0.35);
    }
    .shuttle-pin {
      font-size: 30px;
      transition: all 0.6s linear;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([10.3157, 123.8854], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    // ── User location marker (blue dot) ──────────────────────────────────────
    var userMarker = null;
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-pin"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    window.setUserLocation = function(lat, lng, pan) {
      if (!userMarker) {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
      }
      if (pan) map.setView([lat, lng], 16, { animate: true });
    };

    // ── Live shuttle markers ──────────────────────────────────────────────────
    var shuttleMarkers = {};
    var shuttleIcon = L.divIcon({
      className: '',
      html: '<div class="shuttle-pin">🚌</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    window.upsertShuttle = function(id, lat, lng) {
      if (shuttleMarkers[id]) {
        shuttleMarkers[id].setLatLng([lat, lng]);
      } else {
        shuttleMarkers[id] = L.marker([lat, lng], { icon: shuttleIcon, zIndexOffset: 1000 }).addTo(map);
      }
    };

    window.syncShuttles = function(ids) {
      Object.keys(shuttleMarkers).forEach(function(key) {
        if (ids.indexOf(parseInt(key, 10)) === -1 && ids.indexOf(key) === -1) {
          map.removeLayer(shuttleMarkers[key]);
          delete shuttleMarkers[key];
        }
      });
    };

    // ── Route stop markers ────────────────────────────────────────────────────
    var stopMarkers = {};

    window.renderRouteStops = function(stops, color) {
      Object.keys(stopMarkers).forEach(function(k) { map.removeLayer(stopMarkers[k]); });
      stopMarkers = {};

      var valid = stops.filter(function(s) {
        return s.is_active && s.latitude && s.longitude;
      });

      valid.forEach(function(stop) {
        var marker = L.circleMarker(
          [parseFloat(stop.latitude), parseFloat(stop.longitude)],
          { radius: 10, color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5, bubblingMouseEvents: false }
        );

        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'STOP_TAPPED',
            id: stop.id,
            name: stop.name,
            lat: parseFloat(stop.latitude),
            lng: parseFloat(stop.longitude),
            sequence: stop.sequence,
          }));
        });

        marker.addTo(map);
        stopMarkers[stop.id] = marker;
      });

      var all = Object.keys(stopMarkers).map(function(k) { return stopMarkers[k]; });
      if (all.length > 0) {
        map.fitBounds(L.featureGroup(all).getBounds(), { padding: [60, 60] });
      }
    };

    // Recolour the chosen pickup/dropoff stops so the selection is visible.
    window.markStops = function(pickupId, dropoffId, color) {
      Object.keys(stopMarkers).forEach(function(k) {
        var m = stopMarkers[k];
        if (k == pickupId) {
          m.setStyle({ fillColor: '#22c55e', radius: 13, weight: 3 });
        } else if (k == dropoffId) {
          m.setStyle({ fillColor: '#ef4444', radius: 13, weight: 3 });
        } else {
          m.setStyle({ fillColor: color, radius: 10, weight: 2.5 });
        }
      });
    };

    window.highlightStop = function(lat, lng) {
      map.setView([lat, lng], 16, { animate: true });
    };
  </script>
</body>
</html>
`;

const UserMap = () => {
  const { routeId, busName } = useLocalSearchParams();
  const webRef = useRef(null);
  const pusherRef = useRef(null);
  const trackedShuttleIds = useRef(new Set());

  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [routeColor, setRouteColor] = useState('#f97316');
  const [pickupStop, setPickupStop] = useState(null); // { id, name, lat, lng, sequence }
  const [dropoffStop, setDropoffStop] = useState(null);
  const [selecting, setSelecting] = useState('pickup'); // 'pickup' | 'dropoff'
  const [paraLoading, setParaLoading] = useState(false);
  const [shuttleOnline, setShuttleOnline] = useState(false);

  // ── 1. GPS permission + auto-center ────────────────────────────────────────
  const locateUser = useCallback(async (pan = true) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Access Needed',
        'Turn on location services so the app can show your position near the bus stops.',
        [{ text: 'OK' }]
      );
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = loc.coords;
    webRef.current?.injectJavaScript(
      `window.setUserLocation(${latitude}, ${longitude}, ${pan}); true;`
    );
  }, []);

  // ── 2. Fetch route stops from the API ─────────────────────────────────────
  useEffect(() => {
    setRouteColor(getRouteColor(busName));
    if (!routeId) return;
    apiGet(`routes/${routeId}`).then(({ ok, data }) => {
      if (ok && Array.isArray(data?.stops)) {
        setRouteStops(data.stops.filter((s) => s.is_active));
      }
    });
  }, [routeId, busName]);

  // ── 3. Inject stop pins once map is loaded and stops are fetched ───────────
  useEffect(() => {
    if (!mapLoaded || routeStops.length === 0) return;
    webRef.current?.injectJavaScript(
      `window.renderRouteStops(${JSON.stringify(routeStops)}, '${routeColor}'); true;`
    );
  }, [mapLoaded, routeStops, routeColor]);

  // ── 4. Live shuttle positions: poll + Pusher ──────────────────────────────
  const pollShuttles = useCallback(async () => {
    if (!routeId) return;
    const { ok, data } = await apiGet(`routes/${routeId}/shuttles`);
    if (!ok || !Array.isArray(data)) return;

    const ids = data.map((s) => s.id);
    trackedShuttleIds.current = new Set(ids);
    setShuttleOnline(ids.length > 0);

    data.forEach((s) => {
      webRef.current?.injectJavaScript(
        `window.upsertShuttle(${s.id}, ${s.latitude}, ${s.longitude}); true;`
      );
    });
    webRef.current?.injectJavaScript(
      `window.syncShuttles(${JSON.stringify(ids)}); true;`
    );
  }, [routeId]);

  useEffect(() => {
    if (!mapLoaded) return;
    pollShuttles();
    const interval = setInterval(pollShuttles, SHUTTLE_POLL_MS);
    return () => clearInterval(interval);
  }, [mapLoaded, pollShuttles]);

  useEffect(() => {
    if (!mapLoaded) return;
    let pusher;
    try {
      pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER, forceTLS: true });
      pusherRef.current = pusher;
      const ch = pusher.subscribe('shuttle-locations');
      ch.bind('location.updated', (payload) => {
        if (!payload?.id) return;
        // Only move shuttles we know belong to this route.
        if (!trackedShuttleIds.current.has(payload.id)) return;
        webRef.current?.injectJavaScript(
          `window.upsertShuttle(${payload.id}, ${payload.latitude}, ${payload.longitude}); true;`
        );
      });
    } catch (e) {
      console.warn('[Pusher] init error', e);
    }
    return () => {
      try {
        pusherRef.current?.disconnect();
        pusherRef.current = null;
      } catch {}
    };
  }, [mapLoaded]);

  // ── 5. Handle messages from Leaflet ───────────────────────────────────────
  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type !== 'STOP_TAPPED') return;

      const stop = { id: msg.id, name: msg.name, lat: msg.lat, lng: msg.lng, sequence: msg.sequence };

      let nextPickup = pickupStop;
      let nextDropoff = dropoffStop;

      if (selecting === 'pickup') {
        nextPickup = stop;
        setPickupStop(stop);
        // First time picking pickup → guide them to choose a drop-off next.
        if (!dropoffStop) setSelecting('dropoff');
      } else {
        nextDropoff = stop;
        setDropoffStop(stop);
      }

      webRef.current?.injectJavaScript(
        `window.highlightStop(${msg.lat}, ${msg.lng}); ` +
          `window.markStops(${nextPickup?.id ?? 'null'}, ${nextDropoff?.id ?? 'null'}, '${routeColor}'); true;`
      );
    } catch (_) {}
  };

  const selectSlot = (slot) => {
    setSelecting(slot);
    const stop = slot === 'pickup' ? pickupStop : dropoffStop;
    if (stop) {
      webRef.current?.injectJavaScript(`window.highlightStop(${stop.lat}, ${stop.lng}); true;`);
    }
  };

  // ── 6. Para! → real pickup request ────────────────────────────────────────
  const handlePara = async () => {
    if (!pickupStop || !dropoffStop) {
      Alert.alert(
        'Choose Both Stops',
        'Tap a stop on the map for your pick-up point and another for your drop-off.'
      );
      return;
    }
    if (pickupStop.id === dropoffStop.id) {
      Alert.alert('Pick Different Stops', 'Your pick-up and drop-off must be different stops.');
      return;
    }

    setParaLoading(true);
    try {
      const { ok, status, data } = await apiPost('pickup-requests', {
        route_id: Number(routeId),
        pickup_stop_id: pickupStop.id,
        dropoff_stop_id: dropoffStop.id,
      });

      if (ok) {
        const eta = data?.eta_minutes;
        const accepted = data?.status === 'accepted' || data?.status === 'in_progress';
        Alert.alert(
          'Ride Requested!',
          (accepted
            ? 'A shuttle is on the way.'
            : "You're in the queue — the driver will be notified.") +
            (eta ? `\n\nEstimated arrival: ~${eta} min.` : '') +
            `\n\nPick-up: ${pickupStop.name}\nDrop-off: ${dropoffStop.name}`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Surface the most specific backend message we can.
      let message = data?.message || 'Could not request a ride. Please try again.';
      if (status === 422 && data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first[0]) message = first[0];
        else if (typeof first === 'string') message = first;
      }
      Alert.alert('Ride Not Requested', message);
    } finally {
      setParaLoading(false);
    }
  };

  const canBook = pickupStop && dropoffStop && pickupStop.id !== dropoffStop.id;

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled
        domStorageEnabled
        onLoad={() => {
          setMapLoaded(true);
          locateUser();
        }}
        onMessage={handleMessage}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <BlurView intensity={80} tint="light" style={styles.glassSmall}>
          <Ionicons name="arrow-back" size={22} color="#1A2E1A" />
        </BlurView>
      </TouchableOpacity>

      {/* Shuttle status chip */}
      <View style={styles.statusChip}>
        <View style={[styles.statusDot, { backgroundColor: shuttleOnline ? '#22c55e' : '#9ca3af' }]} />
        <Text style={styles.statusText}>
          {shuttleOnline ? 'Shuttle online' : 'No shuttle online'}
        </Text>
      </View>

      {/* Recenter button */}
      <TouchableOpacity style={styles.recenterBtn} onPress={() => locateUser(true)} activeOpacity={0.8}>
        <BlurView intensity={90} tint="light" style={styles.glassButton}>
          <Ionicons
            name="navigate"
            size={26}
            color="#1A2E1A"
            style={{ transform: [{ translateX: -2 }, { translateY: -1.5 }] }}
          />
        </BlurView>
      </TouchableOpacity>

      {/* Bottom booking card */}
      <View style={styles.card}>
        <Text style={styles.routeLabel}>{busName ?? 'Bus Route'}</Text>
        <Text style={styles.cardTitle}>Book a Ride</Text>

        {/* Pick-up slot */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => selectSlot('pickup')}
          style={[styles.stopRow, selecting === 'pickup' && styles.stopRowActive]}
        >
          <View style={[styles.stopDot, { backgroundColor: pickupStop ? '#22c55e' : '#ccc' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.slotLabel}>PICK-UP</Text>
            <Text
              style={[styles.stopName, !pickupStop && styles.stopPlaceholder]}
              numberOfLines={1}
            >
              {pickupStop ? pickupStop.name : 'Tap a stop on the map'}
            </Text>
          </View>
          {pickupStop && <Text style={styles.stopSeq}>#{pickupStop.sequence}</Text>}
        </TouchableOpacity>

        {/* Drop-off slot */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => selectSlot('dropoff')}
          style={[styles.stopRow, selecting === 'dropoff' && styles.stopRowActive]}
        >
          <View style={[styles.stopDot, { backgroundColor: dropoffStop ? '#ef4444' : '#ccc' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.slotLabel}>DROP-OFF</Text>
            <Text
              style={[styles.stopName, !dropoffStop && styles.stopPlaceholder]}
              numberOfLines={1}
            >
              {dropoffStop ? dropoffStop.name : 'Tap a stop on the map'}
            </Text>
          </View>
          {dropoffStop && <Text style={styles.stopSeq}>#{dropoffStop.sequence}</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paraBtn, (!canBook || paraLoading) && styles.paraBtnLoading]}
          onPress={handlePara}
          disabled={!canBook || paraLoading}
          activeOpacity={0.85}
        >
          {paraLoading ? (
            <ActivityIndicator color="#1A2E1A" />
          ) : (
            <Text style={styles.paraText}>Para!</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: scale(16),
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  statusChip: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusText: { fontFamily: 'Nunito-Bold', fontSize: moderateScale(12), color: '#1A2E1A' },
  recenterBtn: {
    position: 'absolute',
    bottom: moderateScale(245),
    right: scale(16),
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  glassSmall: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(212,230,213,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  glassButton: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: 'rgba(212,230,213,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F4F7F4',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: scale(24),
    paddingTop: moderateScale(20),
    paddingBottom: Platform.OS === 'ios' ? moderateScale(40) : moderateScale(28),
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#3e5141',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  routeLabel: {
    fontSize: moderateScale(11),
    fontFamily: 'Nunito-SemiBold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: moderateScale(22),
    fontFamily: 'Nunito-Bold',
    color: '#1A2E1A',
    marginBottom: moderateScale(12),
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: moderateScale(12),
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8E2',
    marginBottom: moderateScale(10),
  },
  stopRowActive: {
    borderColor: '#3e5141',
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  slotLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(10),
    color: '#999',
    letterSpacing: 1,
    marginBottom: 1,
  },
  stopName: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(15),
    color: '#1A2E1A',
  },
  stopPlaceholder: {
    color: '#bbb',
    fontFamily: 'Nunito-Regular',
    fontStyle: 'italic',
  },
  stopSeq: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(12),
    color: '#999',
    marginLeft: 6,
  },
  paraBtn: {
    backgroundColor: '#FFB82E',
    height: moderateScale(54),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(4),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  paraBtnLoading: {
    opacity: 0.5,
  },
  paraText: {
    fontSize: moderateScale(20),
    color: '#1A2E1A',
    fontFamily: 'Nunito-Black',
  },
});

export default UserMap;
