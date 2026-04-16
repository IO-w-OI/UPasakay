import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const UserMapScreen = () => {
  const webViewRef = useRef(null);
  const [pickupAddress, setPickupAddress] = useState('Locating...');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Search Logic: Converts text to coordinates and moves map
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const jsCode = `map.flyTo([${lat}, ${lon}], 17);`;
        webViewRef.current?.injectJavaScript(jsCode);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // 2. Map Bridge: Updates the pickup address as the map moves
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
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([10.3191, 123.8906], 17);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

          map.on('move', function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              lat: center.lat,
              lng: center.lng
            }));
          });
        </script>
      </body>
    </html>
  `;

  const handleMapMovement = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setPickupAddress(`Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`);
  };

  return (
    <View style={styles.container}>
      {/* MAP ENGINE */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        onMessage={handleMapMovement}
        style={styles.map}
      />

      {/* TOP PILL SEARCH BAR */}
      <View style={styles.topContainer}>
        <View style={styles.searchPill}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A2E1A" />
          </TouchableOpacity>
          
          <TextInput 
            style={styles.searchInput}
            placeholder="Enter your location"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* CENTER PIN (STAYS FIXED) */}
      <View style={styles.centerPinContainer} pointerEvents="none">
        <View style={styles.pinWrapper}>
            <Ionicons name="location" size={50} color="#7B2D26" />
            <View style={styles.pinShadow} />
        </View>
      </View>

      {/* PICKUP CARD */}
      <BlurView intensity={90} tint="light" style={styles.bookingCard}>
        <Text style={styles.cardHeader}>Pick-up Point</Text>
        
        <View style={styles.inputBox}>
          <View style={styles.greenDotContainer}>
            <Ionicons name="location" size={16} color="white" />
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {pickupAddress}
          </Text>
        </View>

        <TouchableOpacity 
            style={styles.paraButton} 
            activeOpacity={0.8}
            onPress={() => console.log("Booking at:", pickupAddress)}
        >
          <Text style={styles.paraText}>Para!</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topContainer: {
    position: 'absolute', top: 60, width: '100%',
    paddingHorizontal: 20, zIndex: 10,
  },
  searchPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    height: 55, borderRadius: 30, paddingHorizontal: 15,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  backButton: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 , fontFamily: 'Nunito-Bold'},
  centerPinContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', zIndex: 5,
  },
  pinWrapper: { alignItems: 'center', transform: [{ translateY: -25 }] },
  pinShadow: {
    width: 6, height: 6, backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 3, marginTop: -4,
  },
  bookingCard: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    // Removed width: width * 0.9 to let it kiss the sides
    padding: 30, 
    paddingBottom: 40, // Extra space for the home indicator
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40,
    backgroundColor: '#F2F9F3', 
    overflow: 'hidden',
    // Border matches the fill to look seamless
    borderWidth: 1, 
    borderRadius: 40,
    borderColor: '#3e5141',
    // Optional shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 19 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 20,
  },
  cardHeader: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#1A2E1A' , fontFamily: 'Nunito-Bold'},
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 75, borderWidth: 1.5, borderColor: '#1A2E1A',
    marginBottom: 20,
  },
  greenDotContainer: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#004d00',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  addressText: { fontSize: 16, color: '#333', flex: 1, fontFamily: 'Nunito-Bold'},
  paraButton: {
    backgroundColor: '#FFB82E', height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  paraText: { fontSize: 22, fontWeight: '900', color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
});

export default UserMapScreen;