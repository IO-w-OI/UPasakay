import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SnappyAnim = {
  duration: 200,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

const UserMapScreen = () => {
  const webViewRef = useRef(null);
  const reverseGeocodeTimer = useRef(null);

  const [status, setStatus] = useState('searching');
  const [pickupAddress, setPickupAddress] = useState('Locating...');
  const [currentCoords, setCurrentCoords] = useState({ lat: 10.3381, lng: 123.9116 });
  const [searchText, setSearchText] = useState('');

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: white; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-control-attribution { display: none; }
          .bus-marker-icon {
            transition: all 0.4s linear;
            font-size: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([10.3381, 123.9116], 16);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

          var busMarker = null;
          var destMarker = null;
          var estimatorLine = null;   // full upcoming route — shrinks as the bus advances
          var fullRouteLine = null;   // faint dashed reference line

          function clearRoute() {
            if (busMarker)      { map.removeLayer(busMarker);      busMarker = null; }
            if (destMarker)     { map.removeLayer(destMarker);     destMarker = null; }
            if (estimatorLine)  { map.removeLayer(estimatorLine);  estimatorLine = null; }
            if (fullRouteLine)  { map.removeLayer(fullRouteLine);  fullRouteLine = null; }
          }

          window.clearRoute = clearRoute;

          // Pan map to a coord (used by the search bar)
          window.panTo = function(lat, lng) {
            map.setView([lat, lng], 16, { animate: true });
          };

          window.startBusFromUPC = async function(destLat, destLng) {
            clearRoute();

            var startLat = 10.3381;
            var startLng = 123.9116;
            try {
              const url = "https://router.project-osrm.org/route/v1/driving/" +
                          startLng + "," + startLat + ";" + destLng + "," + destLat +
                          "?overview=full&geometries=geojson";
              const response = await fetch(url);
              const data = await response.json();
              const routeCoords = data.routes[0].geometry.coordinates;
              const latLngs = routeCoords.map(c => [c[1], c[0]]);

              destMarker = L.marker([destLat, destLng]).addTo(map);

              // Faint reference of the WHOLE trip
              fullRouteLine = L.polyline(latLngs, {
                color: '#3e5141', weight: 3, opacity: 0.25, dashArray: '6,8'
              }).addTo(map);

              // ESTIMATOR — drawn BEFORE the bus moves; gets eaten from the back as bus advances
              estimatorLine = L.polyline(latLngs, {
                color: '#7B2D26', weight: 5, opacity: 0.9, lineJoin: 'round'
              }).addTo(map);

              var busIcon = L.divIcon({ className: 'bus-marker-icon', html: '🚌', iconSize:[40,40] });
              busMarker = L.marker(latLngs[0], { icon: busIcon }).addTo(map);

              map.fitBounds(L.latLngBounds(latLngs), { padding: [80, 80] });

              let i = 0;
              function drive() {
                if (i < latLngs.length) {
                  busMarker.setLatLng(latLngs[i]);
                  // Shrink the estimator: only show what's still ahead of the bus
                  estimatorLine.setLatLngs(latLngs.slice(i));
                  i++;
                  setTimeout(drive, 400);
                } else {
                  // Bus arrived — DO NOT clear. Wait for "I have boarded".
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ARRIVED' }));
                }
              }
              drive();
            } catch (err) { console.error(err); }
          };

          map.on('move', function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MOVE', lat: center.lat, lng: center.lng }));
          });
        </script>
      </body>
    </html>
  `;

  const clearMap = () => {
    webViewRef.current?.injectJavaScript('window.clearRoute && window.clearRoute(); true;');
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const a = data.address || {};
      const name =
        a.suburb || a.neighbourhood || a.village || a.town ||
        a.city_district || a.city || a.county || data.display_name;
      return name || 'Unknown area';
    } catch (e) {
      console.log('Reverse geocode failed:', e);
      return 'Unknown area';
    }
  };

  // 🔎 Forward geocoding for the search bar
  const forwardGeocode = async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Cebu, Philippines')}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data || data.length === 0) return null;
      const hit = data[0];
      const a = hit.address || {};
      const label =
        a.suburb || a.neighbourhood || a.village || a.town ||
        a.city_district || a.city || hit.display_name;
      return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), label };
    } catch (e) {
      console.log('Forward geocode failed:', e);
      return null;
    }
  };

  const handleSearchSubmit = async () => {
    const q = searchText.trim();
    if (!q) return;
    setPickupAddress('Searching...');
    const hit = await forwardGeocode(q);
    if (!hit) {
      setPickupAddress('No results for "' + q + '"');
      return;
    }
    console.log(`🔎 Search result: ${hit.lat}, ${hit.lng} (${hit.label})`);
    setCurrentCoords({ lat: hit.lat, lng: hit.lng });
    setPickupAddress(hit.label);
    webViewRef.current?.injectJavaScript(`window.panTo(${hit.lat}, ${hit.lng}); true;`);
  };

  const handleMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === 'MOVE') {
      setCurrentCoords({ lat: data.lat, lng: data.lng });
      console.log(`📍 Coords: ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`);

      if (status === 'searching') {
        if (reverseGeocodeTimer.current) clearTimeout(reverseGeocodeTimer.current);
        setPickupAddress('Locating...');
        reverseGeocodeTimer.current = setTimeout(async () => {
          const name = await reverseGeocode(data.lat, data.lng);
          setPickupAddress(name);
        }, 500);
      }
    }

    if (data.type === 'ARRIVED') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bus Arrived! 🚌",
          body: "Sir Sanford is at your location. Please board the bus within the minute!",
          sound: true,
        },
        trigger: null,
      });
      LayoutAnimation.configureNext(SnappyAnim);
      setStatus('arrived');
      // 👇 No clearRoute here — bus + remaining trail stay on the map until "I have boarded"
    }
  };

  const handleParaPress = () => {
    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('booking');
    webViewRef.current?.injectJavaScript(`window.startBusFromUPC(${currentCoords.lat}, ${currentCoords.lng});`);
  };

  const handleCancel = () => {
    clearMap();
    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('searching');
  };

  const handleBoarded = () => {
    clearMap(); // ✅ only place the bus + trail get removed after a successful trip
    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('searching');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          onMessage={handleMessage}
          style={styles.map}
          containerStyle={{ backgroundColor: '#fff' }}
        />
      </View>

      {status === 'searching' && (
        <>
          <View style={styles.topContainer}>
            <View style={styles.searchPill}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#1A2E1A" />
              </TouchableOpacity>
              <TextInput
                style={[styles.searchInput, {fontFamily: 'Nunito-Regular'}]}
                placeholder="Where to pick up?"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={handleSearchSubmit}>
                  <Ionicons name="search" size={22} color="#1A2E1A" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.centerPinContainer} pointerEvents="none">
            <Ionicons name="location" size={50} color="#7B2D26" />
          </View>
        </>
      )}

      <View style={styles.bookingCard}>
        {status === 'searching' ? (
          <>
            <Text style={styles.cardHeader}>Pick-up Point</Text>
            <View style={styles.inputBox}>
              <View style={styles.greenDot}><Ionicons name="location" size={14} color="white" /></View>
              <Text style={styles.addressText} numberOfLines={1}>{pickupAddress}</Text>
            </View>
            <TouchableOpacity style={styles.paraBtn} onPress={handleParaPress}>
              <Text style={styles.paraText}>Para!</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.waitingContent}>
            <View style={styles.row}>
               <View>
                 <Text style={styles.arriveTitle}>Arriving by 6:05AM</Text>
                 <Text style={styles.arriveSub}>Traveling from UP Cebu...</Text>
               </View>
               <View style={styles.timeline}>
                 <Ionicons name="bus" size={20} color="#1A2E1A"/><Text style={{color: '#ccc'}}>---</Text><Ionicons name="person" size={20} color="#1A2E1A"/>
               </View>
            </View>
            <View style={styles.driverSection}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' }} style={styles.avatar} />
              <View>
                <Text style={styles.dName}>Sanford Marin Vinuya</Text>
                <Text style={styles.dRoute}>UP Cebu Bus Route</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel Para</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {status === 'arrived' && (
        <View style={styles.overlay}>
          <View style={styles.dimmer} />
          <View style={styles.arrivalModal}>
            <View style={styles.modalTop}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' }} style={styles.modalAvatar} />
              <View>
                <Text style={styles.modalTitle}>Sir Sanford has arrived</Text>
                <Text style={styles.modalSub}>Please board the bus on time!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.boardedBtn} onPress={handleBoarded}>
              <Text style={styles.boardedText}>I have boarded!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapWrapper: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1, opacity: 0.99 },
  topContainer: { position: 'absolute', top: 60, width: '100%', paddingHorizontal: 20, zIndex: 10 },
  searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 55, borderRadius: 30, paddingHorizontal: 15, elevation: 5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  centerPinContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  bookingCard: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    padding: 30, paddingBottom: Platform.OS === 'ios' ? 45 : 35,
    backgroundColor: '#F4F7F4', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    borderWidth: 1.5, borderBottomWidth: 0, borderColor: '#3e5141', elevation: 20, zIndex: 20,
  },
  cardHeader: { fontSize: 22, color: '#1A2E1A', marginBottom: 15, fontFamily: 'Nunito-Bold' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 30, borderWidth: 1, borderColor: '#1A2E1A', marginBottom: 15 },
  greenDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#004d00', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addressText: { flex: 1, fontFamily: 'Nunito-Regular', color: '#1A2E1A' },
  paraBtn: { backgroundColor: '#FFB82E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  paraText: { fontSize: 20, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
  arriveTitle: { fontSize: 22, color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
  arriveSub: { fontSize: 14, color: '#666', fontFamily: 'Nunito-Regular' },
  dName: { fontSize: 18, color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
  dRoute: { fontSize: 14, color: '#444', fontFamily: 'Nunito-Regular' },
  cancelBtn: { backgroundColor: '#8B211E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: '#fff', fontSize: 18, fontFamily: 'Nunito-Black' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  dimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  arrivalModal: { width: width * 0.85, backgroundColor: '#F4F7F4', borderRadius: 35, padding: 25, borderWidth: 1.5, borderColor: '#3e5141' },
  modalTitle: { fontSize: 18, color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
  modalSub: { fontSize: 13, color: '#555', fontFamily: 'Nunito-Regular' },
  boardedBtn: { backgroundColor: '#FFB82E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  boardedText: { fontSize: 18, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverSection: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  modalTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
});

export default UserMapScreen;
