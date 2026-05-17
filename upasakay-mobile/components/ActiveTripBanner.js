import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useTrip } from '../context/TripContext';

export default function ActiveTripBanner() {
  const { activeTrip } = useTrip();
  const pathname = usePathname();

  // Hides only if no trip OR if currently on the booking/map screen
  if (!activeTrip || pathname.includes('UserBooking')) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.wrap}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: '/UserBooking',
        params: { active: 'true', busName: activeTrip.route || '' }
      })}
    >
      <View style={styles.topAccent} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Arriving by {activeTrip.etaText || "6:55AM"}</Text>
            <Text style={styles.sub}>{activeTrip.distanceText || "7km to go - around 55 mins"}</Text>
          </View>
          
          <View style={styles.brandingBox}>
            <Image 
              source={require('../assets/images/UPasakaySmall.png')} 
              style={styles.busLogo} 
              resizeMode="contain"
            />
            <Text style={styles.dotLine}>..........</Text>
            <Image 
              source={require('../assets/images/react-logo.png')} 
              style={styles.upSeal} 
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.driverRow}>
          <Image source={{ uri: activeTrip.avatarUri }} style={styles.avatar} />
          <View>
            <Text style={styles.dName}>{activeTrip.driverName || "Sanford Marin Vinuya"}</Text>
            <Text style={styles.dRoute}>{activeTrip.route || "UP Cebu City Bus Route"}</Text>
            <Text style={styles.dRole}>Driver</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 15, right: 15,
    bottom: 100, 
    backgroundColor: '#F4F7F4',
    borderRadius: 45,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 0.5,
    borderColor: '#060606', 
  },
  topAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 60,
    backgroundColor: '#F4F7F4', 
    borderBottomLeftRadius: 40,
  },
  content: {
    padding: 20,
    paddingTop: 15,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  busLogo: { width: 45, height: 45 },
  upSeal: { width: 40, height: 40 },
  dotLine: { color: '#1A2E1A', marginHorizontal: 5, fontWeight: 'bold' },
  title: { 
    fontFamily: 'Nunito-Bold', 
    fontSize: 22, 
    color: '#014421',
  },
  sub: { 
    fontFamily: 'Nunito-Regular', 
    fontSize: 13, 
    color: '#1A2E1A',
    opacity: 0.8,
  },
  driverRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 5,
    backgroundColor: 'rgba(255,255,255,0.4)', 
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dName: { 
    fontFamily: 'Nunito-Bold', 
    fontSize: 18, 
    color: '#1A2E1A' 
  },
  dRoute: { 
    fontFamily: 'Nunito-Regular', 
    fontSize: 12, 
    color: '#444' 
  },
  dRole: { 
    fontFamily: 'Nunito-Regular', 
    fontSize: 12, 
    color: '#666' 
  },
});