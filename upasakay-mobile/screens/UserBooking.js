import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UserMapScreen = () => {
  const webViewRef = useRef(null);
  const [status, setStatus] = useState('searching'); 
  const [pickupAddress, setPickupAddress] = useState('Locating...');
  const [currentCoords, setCurrentCoords] = useState({ lat: 10.3381, lng: 123.9116 });

  // 1. Leaflet HTML with Fixed Start Point (UP Cebu)
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
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

          window.startBusFromUPC = async function(destLat, destLng) {
            // FIXED POINT X: UP Cebu Lahug Campus
            var startLat = 10.3381;
            var startLng = 123.9116;

            try {
              const url = "https://router.project-osrm.org/route/v1/driving/" + 
                          startLng + "," + startLat + ";" + destLng + "," + destLat + 
                          "?overview=full&geometries=geojson";
              
              const response = await fetch(url);
              const data = await response.json();
              const routeCoords = data.routes[0].geometry.coordinates;

              L.marker([destLat, destLng]).addTo(map);

              var busIcon = L.divIcon({ className: 'bus-marker-icon', html: '🚌', iconSize:[40,40] });
              busMarker = L.marker([routeCoords[0][1], routeCoords[0][0]], { icon: busIcon }).addTo(map);

              var bounds = L.latLngBounds(routeCoords.map(c => [c[1], c[0]]));
              map.fitBounds(bounds, { padding: [80, 80] });

              let i = 0;
              function drive() {
                if (i < routeCoords.length) {
                  busMarker.setLatLng([routeCoords[i][1], routeCoords[i][0]]);
                  i++;
                  setTimeout(drive, 400);
                } else {
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

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'MOVE') {
      setCurrentCoords({ lat: data.lat, lng: data.lng });
      if (status === 'searching') {
        setPickupAddress(`Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`);
      }
    }
    if (data.type === 'ARRIVED') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setStatus('arrived');
    }
  };

  const handleParaPress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStatus('booking');
    webViewRef.current?.injectJavaScript(`window.startBusFromUPC(${currentCoords.lat}, ${currentCoords.lng});`);
  };

  return (
    <View style={styles.container}>
      <WebView ref={webViewRef} source={{ html: mapHtml }} onMessage={handleMessage} style={styles.map} />

      {status === 'searching' && (
        <>
          <View style={styles.topContainer}>
            <View style={styles.searchPill}>
              <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1A2E1A" /></TouchableOpacity>
              <TextInput style={[styles.searchInput, {fontFamily: 'Nunito-Regular'}]} placeholder="Where to pick up?" />
            </View>
          </View>
          <View style={styles.centerPinContainer} pointerEvents="none">
            <Ionicons name="location" size={50} color="#7B2D26" />
          </View>
        </>
      )}

      {/* THE BOTTOM CARD WITH BORDER */}
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
               <View style={styles.timeline}><Ionicons name="bus" size={20}/><Text>---</Text><Ionicons name="person" size={20}/></View>
            </View>
            <View style={styles.driverSection}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' }} style={styles.avatar} />
              <View>
                <Text style={styles.dName}>Sanford Marin Vinuya</Text>
                <Text style={styles.dRoute}>UP Cebu Bus Route</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatus('searching')}>
              <Text style={styles.cancelText}>Cancel Para</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ARRIVAL MODAL */}
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
            <TouchableOpacity style={styles.boardedBtn} onPress={() => setStatus('searching')}>
              <Text style={styles.boardedText}>I have boarded!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topContainer: { position: 'absolute', top: 60, width: '100%', paddingHorizontal: 20 },
  searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 55, borderRadius: 30, paddingHorizontal: 15, elevation: 5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  centerPinContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  
  // Card with Border and Nunito
  bookingCard: { 
  position: 'absolute', 
  bottom: 0,           // Ensure this is 0
  left: 0, 
  right: 0,
  padding: 30, 
  paddingBottom: 50,   // Increase this to push content above the home indicator
  backgroundColor: '#F4F7F4', 
  borderTopLeftRadius: 40, 
  borderTopRightRadius: 40,
  borderWidth: 1.5, 
  borderColor: '#3e5141', 
  elevation: 20, 
  zIndex: 20,
},
  cardHeader: { fontSize: 22, color: '#1A2E1A', marginBottom: 15, fontFamily: 'Nunito-Bold' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 30, borderWidth: 1, borderColor: '#1A2E1A', marginBottom: 15 },
  greenDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#004d00', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addressText: { flex: 1, fontFamily: 'Nunito-Regular' },
  paraBtn: { backgroundColor: '#FFB82E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  paraText: { fontSize: 20, color: '#1A2E1A', fontFamily: 'Nunito-Black' },

  // Waiting/Arrival Styles
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
  
  // Helper rows
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  timeline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverSection: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  modalTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
});

export default UserMapScreen;