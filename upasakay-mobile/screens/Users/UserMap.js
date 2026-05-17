import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Added for Liquid Glass effect
import * as Location from 'expo-location';
import { useCallback, useRef } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'; // Added Platform
import { WebView } from 'react-native-webview';

// Leaflet (OpenStreetMap) in a WebView — same approach as the Driver map and
// the booking screen, so the app needs no Google Maps API key on Android.
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
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var userMarker = null;
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-pin"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Called from React Native via injectJavaScript
    window.setUserLocation = function (lat, lng) {
      if (!userMarker) {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], 17, { animate: true });
    };
  </script>
</body>
</html>
`;

const UserMap = () => {
  const webRef = useRef(null);

  const recenter = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow location to see your distance from the bus.');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;

    webRef.current?.injectJavaScript(
      `window.setUserLocation(${latitude}, ${longitude}); true;`
    );
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled
        domStorageEnabled
        onLoad={recenter}
      />

      {/* Floating Liquid Glass Recenter Button */}
      <TouchableOpacity
        style={styles.recenterButtonWrapper}
        onPress={recenter}
        activeOpacity={0.8}
      >
        <BlurView intensity={90} tint="light" style={styles.glassButton}>
        <Ionicons
        name="navigate"
        size={28} // Slightly larger looks better on the high-res iPhone Air
        color="#1A2E1A"
        style={Platform.select({
            ios: {
            // THE FIX FOR IPHONE:
            // Pulling it UP (negative Y) and LEFT (negative X)
            transform: [
                { translateX: -2 },
                { translateY: -1.5 }
            ],
            },
            android: {
            // Keeping your previous Android fix
            transform: [
                { translateX: -2 },
                { translateY: -1.5 }
            ],
            },
        })}
        />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  recenterButtonWrapper: {
    position: 'absolute',
    bottom: 130, // Adjusted to clear your Big Pill tab bar (85 height + 30 bottom)
    right: 20,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  glassButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 230, 213, 0.65)', // Liquid Glass Tint
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default UserMap;
