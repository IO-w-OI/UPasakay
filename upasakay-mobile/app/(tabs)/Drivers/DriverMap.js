import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Pusher from 'pusher-js/react-native';

import { currentUser, API_URL } from '../../../services/UserStore';

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY ?? 'f21efd02988d084b7b35';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER ?? 'ap1';

const LOCATION_TASK = 'driver-location-task';

export const driverLocations = {};

function getDriverId() {
  return currentUser?.email ?? 'driver-unknown';
}

// ---------- Shared GPS send helper ----------
function sendLocationToBackend(latitude, longitude, speedMs) {
  if (!currentUser?.token || !currentUser?.id) return;
  fetch(`${API_URL}/driver/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${currentUser.token}`,
    },
    body: JSON.stringify({
      user_id: currentUser.id,
      latitude,
      longitude,
      speed_kmh: parseFloat(((speedMs ?? 0) * 3.6).toFixed(2)),
    }),
  }).catch(err => console.warn('[GPS] send failed:', err));
}

// ---------- Background GPS task ----------
TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) { console.log('[LOCATION_TASK] error', error); return; }
  if (!data) return;
  const { locations } = data;
  if (!locations?.length) return;
  const { latitude, longitude, speed, heading } = locations[0].coords;
  const id = getDriverId();
  driverLocations[id] = { latitude, longitude, speed: speed ?? 0, heading: heading ?? 0, updatedAt: Date.now() };
  console.log('[DRIVER GPS]', id, latitude, longitude);
  sendLocationToBackend(latitude, longitude, speed);
});

// ---------- Leaflet HTML ----------
const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .passenger-pin {
      background: #2563eb;
      width: 30px; height: 30px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; line-height: 1;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([14.1651, 121.2402], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    let driverMarker = null;
    let passengerMarkers = {};

    const passengerIcon = L.divIcon({
      className: '',
      html: '<div class="passenger-pin">🧍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18],
    });

    // Called from React Native via injectJavaScript
    window.addPassengerPin = function(id, lat, lng, label) {
      if (passengerMarkers[id]) {
        passengerMarkers[id].setLatLng([lat, lng]);
        return;
      }
      const marker = L.marker([lat, lng], { icon: passengerIcon })
        .addTo(map)
        .bindPopup('<b>' + (label || 'Passenger') + '</b><br>Waiting here');
      passengerMarkers[id] = marker;
    };

    window.removePassengerPin = function(id) {
      if (passengerMarkers[id]) {
        map.removeLayer(passengerMarkers[id]);
        delete passengerMarkers[id];
      }
    };

    // Driver marker (via postMessage from React Native)
    window.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'driver') {
          const { lat, lng } = msg;
          if (!driverMarker) {
            driverMarker = L.marker([lat, lng]).addTo(map).bindPopup('You');
            map.setView([lat, lng], 17);
          } else {
            driverMarker.setLatLng([lat, lng]);
          }
        }
      } catch (err) {}
    });

    document.addEventListener('message', (e) =>
      window.dispatchEvent(new MessageEvent('message', { data: e.data }))
    );
  </script>
</body>
</html>
`;

export default function DriverMap() {
  const webRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [coords, setCoords] = useState(null);
  const watcherRef = useRef(null);
  const pusherRef = useRef(null);

  // ---------- Inject a passenger pin into the WebView ----------
  const injectPassengerPin = useCallback((id, lat, lng, label) => {
    // JSON.stringify the label so quotes/special chars are safely escaped
    const safeLabel = JSON.stringify(String(label ?? 'Passenger'));
    const js = `window.addPassengerPin(${id}, ${lat}, ${lng}, ${safeLabel}); true;`;
    webRef.current?.injectJavaScript(js);
  }, []);

  const removePassengerPin = useCallback((id) => {
    webRef.current?.injectJavaScript(`window.removePassengerPin(${id}); true;`);
  }, []);

  // ---------- Fetch active pickup requests and plot them ----------
  const fetchPassengerRequests = useCallback(async () => {
    if (!currentUser?.token) return;
    try {
      const res = await fetch(`${API_URL}/pickup-requests`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      if (!res.ok) {
        console.warn('[Passengers] fetch failed, status:', res.status);
        return;
      }

      const json = await res.json();
      // API may return array directly or wrapped in { data: [...] }
      const requests = Array.isArray(json) ? json : (json.data ?? []);

      const active = requests.filter(
        (r) =>
          ['pending', 'accepted', 'in_progress'].includes(r.status) &&
          r.pickup_stop?.latitude != null &&
          r.pickup_stop?.longitude != null
      );

      active.forEach((r) => {
        injectPassengerPin(
          r.id,
          r.pickup_stop.latitude,
          r.pickup_stop.longitude,
          r.user?.full_name ?? r.passenger?.full_name ?? 'Passenger'
        );
      });

      console.log(`[Passengers] plotted ${active.length} active request(s)`);
    } catch (err) {
      console.warn('[Passengers] fetch error:', err);
    }
  }, [injectPassengerPin]);

  // ---------- WebView ready — fetch existing passengers ----------
  const onWebViewLoad = useCallback(() => {
    fetchPassengerRequests();
  }, [fetchPassengerRequests]);

  // ---------- Pusher real-time listener ----------
  useEffect(() => {
    if (!currentUser?.token) return;

    pusherRef.current = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });

    // New passenger booking → add pin immediately
    const bookingChannel = pusherRef.current.subscribe('driver-requests');
    bookingChannel.bind('passenger.booked', (data) => {
      const lat = data?.pickup_stop?.latitude ?? data?.pickup_latitude;
      const lng = data?.pickup_stop?.longitude ?? data?.pickup_longitude;
      const id  = data?.pickup_request_id ?? data?.id;
      const name = data?.passenger?.full_name ?? data?.passenger_name ?? 'Passenger';
      if (id != null && lat != null && lng != null) {
        injectPassengerPin(id, lat, lng, name);
      }
    });

    // Ride accepted / status change → re-fetch the full list to stay in sync
    const adminChannel = pusherRef.current.subscribe('admin-rides');
    adminChannel.bind('ride.accepted', () => {
      fetchPassengerRequests();
    });

    return () => {
      bookingChannel.unbind_all();
      pusherRef.current?.unsubscribe('driver-requests');
      adminChannel.unbind_all();
      pusherRef.current?.unsubscribe('admin-rides');
      pusherRef.current?.disconnect();
      pusherRef.current = null;
    };
  }, [injectPassengerPin, fetchPassengerRequests]);

  // ---------- Cleanup GPS on unmount ----------
  useEffect(() => {
    return () => { stopSharing(); };
  }, []);

  const sendToMap = (lat, lng) => {
    webRef.current?.postMessage(JSON.stringify({ type: 'driver', lat, lng }));
  };

  const startSharing = async () => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      Alert.alert('Permission needed', 'Enable location access to share your position.');
      return;
    }

    try {
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 5,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'UPasakay Driver',
            notificationBody: 'Sharing your location with passengers',
          },
        });
      }
    } catch (e) {
      console.log('background perm error', e);
    }

    watcherRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (loc) => {
        const { latitude, longitude, speed, heading } = loc.coords;
        console.log(`📍 DRIVER_POS: [${latitude.toFixed(6)}, ${longitude.toFixed(6)}] | Speed: ${((speed ?? 0) * 3.6).toFixed(1)} km/h`);
        setCoords({ latitude, longitude });
        sendToMap(latitude, longitude);
        sendLocationToBackend(latitude, longitude, speed);

        const id = getDriverId();
        driverLocations[id] = { latitude, longitude, speed: speed ?? 0, heading: heading ?? 0, updatedAt: Date.now() };
      }
    );

    setSharing(true);
  };

  const stopSharing = async () => {
    try { watcherRef.current?.remove(); watcherRef.current = null; } catch {}
    try {
      const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
      if (started) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    } catch {}
    setSharing(false);
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
        onLoad={onWebViewLoad}
      />

      <View style={styles.topBar}>
        <Text style={styles.barText}>
          {sharing
            ? coords
              ? `📡 ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
              : 'Starting GPS…'
            : 'Not sharing'}
        </Text>

        <TouchableOpacity
          style={[styles.btn, sharing ? styles.stop : styles.start]}
          onPress={sharing ? stopSharing : startSharing}
        >
          <Ionicons
            name={sharing ? 'stop-circle-outline' : 'navigate-circle-outline'}
            size={20}
            color="#fff"
          />
          <Text style={styles.btnText}>{sharing ? 'Stop' : 'Start sharing'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  barText: { fontSize: 14, fontWeight: '600', color: '#222' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  start: { backgroundColor: '#16a34a' },
  stop: { backgroundColor: '#dc2626' },
  btnText: { color: '#fff', fontWeight: '700' },
});
