import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Map icons to your route names
          const icons = {
            index: 'home-outline',
            UserRecents: 'clock-outline',
            UserProfile: 'account-circle-outline',
          };

          return (
            <TouchableOpacity key={index} onPress={onPress} style={styles.tabItem}>
              {/* The "Highlight" circle for the active tab */}
              <View style={[styles.iconCircle, isFocused && styles.activeCircle]}>
                <MaterialCommunityIcons 
                  name={icons[route.name]} 
                  size={28} 
                  color={isFocused ? '#1A2E1A' : '#6A9A6A'} 
                />
              </View>
              <Text style={[styles.label, { color: isFocused ? '#1A2E1A' : '#6A9A6A' }]}>
                {route.name === 'index' ? 'Home' : route.name.replace('User', '')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30, // Floats it above the bottom edge
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 230, 213, 0.9)', // Light green translucent
    width: '90%',
    height: 75,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#A8C6A8',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    padding: 8,
    borderRadius: 25,
  },
  activeCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // The soft white glow behind active icon
  },
  label: { fontSize: 12, marginTop: -2, fontFamily: 'Nunito-Bold' }
});

export default CustomTabBar;