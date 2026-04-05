import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Added for Liquid Glass effect
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'; // Added Platform
import MapView from 'react-native-maps';

const UserMap = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);

  const recenter = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow location to see your distance from the bus.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);

    mapRef.current?.animateToRegion({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  useEffect(() => {
    recenter();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 10.3157,
          longitude: 123.8854,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
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