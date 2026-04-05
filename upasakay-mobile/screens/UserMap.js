import { Dimensions, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

const UserMap = () => {
  return (
    <View style={styles.container}>
      <MapView
        // provider={PROVIDER_GOOGLE} // Uncomment this if you have a Google API Key
        style={styles.map}
        initialRegion={{
          latitude: 10.3157, // Central Cebu City
          longitude: 123.8854,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default UserMap;