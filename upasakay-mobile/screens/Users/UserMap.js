import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
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

import { apiGet } from '../../services/apiClient';
import { moderateScale, scale } from '../../utils/responsive';

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

    // ── Route stop markers ────────────────────────────────────────────────────
    var stopMarkers = [];

    window.renderRouteStops = function(stops, color) {
      stopMarkers.forEach(function(m) { map.removeLayer(m); });
      stopMarkers = [];

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
            name: stop.name,
            lat: parseFloat(stop.latitude),
            lng: parseFloat(stop.longitude),
            sequence: stop.sequence,
          }));
          marker.bindPopup(
            '<div style="font-family:sans-serif;min-width:110px">' +
            '<b>' + stop.name + '</b><br>' +
            '<span style="color:#666;font-size:12px">Stop #' + stop.sequence + '</span>' +
            '</div>'
          ).openPopup();
        });

        marker.addTo(map);
        stopMarkers.push(marker);
      });

      if (stopMarkers.length > 0) {
        map.fitBounds(L.featureGroup(stopMarkers).getBounds(), { padding: [60, 60] });
      }
    };

    // Pan to a stop when selected from the card
    window.highlightStop = function(lat, lng) {
      map.setView([lat, lng], 17, { animate: true });
    };
  </script>
</body>
</html>
`;

const UserMap = () => {
  const { routeId, busName } = useLocalSearchParams();
  const webRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [routeColor, setRouteColor] = useState('#f97316');
  const [pickupStop, setPickupStop] = useState(null); // { name, lat, lng, sequence }
  const [paraLoading, setParaLoading] = useState(false);

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
        setRouteStops(data.stops.filter(s => s.is_active));
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

  // ── 4. Handle messages from Leaflet ───────────────────────────────────────
  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'STOP_TAPPED') {
        setPickupStop({ name: msg.name, lat: msg.lat, lng: msg.lng, sequence: msg.sequence });
        webRef.current?.injectJavaScript(
          `window.highlightStop(${msg.lat}, ${msg.lng}); true;`
        );
      }
    } catch (_) {}
  };

  // ── 5. Para! with loading feedback ────────────────────────────────────────
  const handlePara = async () => {
    if (!pickupStop) {
      Alert.alert(
        'Choose a Stop',
        'Tap one of the colored stops on the map to set your pick-up point first.'
      );
      return;
    }
    setParaLoading(true);
    try {
      // TODO: replace with real pickup-requests POST
      await new Promise((r) => setTimeout(r, 1200));
      Alert.alert('Ride Requested!', `Pick-up from: ${pickupStop.name}`);
    } finally {
      setParaLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled
        domStorageEnabled
        onLoad={() => { setMapLoaded(true); locateUser(); }}
        onMessage={handleMessage}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <BlurView intensity={80} tint="light" style={styles.glassSmall}>
          <Ionicons name="arrow-back" size={22} color="#1A2E1A" />
        </BlurView>
      </TouchableOpacity>

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
        <Text style={styles.cardTitle}>Pick-up Point</Text>

        <View style={styles.stopRow}>
          <View style={[styles.stopDot, { backgroundColor: pickupStop ? routeColor : '#ccc' }]} />
          <Text
            style={[styles.stopName, !pickupStop && styles.stopPlaceholder]}
            numberOfLines={1}
          >
            {pickupStop ? pickupStop.name : 'Tap a stop on the map'}
          </Text>
          {pickupStop && (
            <Text style={styles.stopSeq}>#{pickupStop.sequence}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.paraBtn, paraLoading && styles.paraBtnLoading]}
          onPress={handlePara}
          disabled={paraLoading}
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
  recenterBtn: {
    position: 'absolute',
    bottom: moderateScale(175),
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
    padding: moderateScale(14),
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#1A2E1A',
    marginBottom: moderateScale(14),
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  stopName: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: moderateScale(15),
    color: '#1A2E1A',
  },
  stopPlaceholder: {
    color: '#bbb',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  paraBtnLoading: {
    opacity: 0.65,
  },
  paraText: {
    fontSize: moderateScale(20),
    color: '#1A2E1A',
    fontFamily: 'Nunito-Black',
  },
});

export default UserMap;
