# Mobile App Integration Guide

## Quick Reference for Mobile Developers

### Base URL
```
http://localhost:8000/api  (development)
https://api.upasakay.com/api  (production)
```

### Authentication
All driver endpoints require a Sanctum token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 1. Active Shuttle Display (Passenger Screen)

### Fetch Active Shuttle Information
```typescript
// Get the active shuttle with all details
async function getActiveShuttle(token: string) {
  const response = await fetch('/api/shuttle/active', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null; // No active shuttle
    }
    throw new Error('Failed to fetch shuttle');
  }
  
  return response.json();
}

// Usage in React Native
const [shuttle, setShuttle] = useState(null);

useEffect(() => {
  getActiveShuttle(authToken).then(setShuttle);
  
  // Poll every 30 seconds for updates
  const interval = setInterval(() => {
    getActiveShuttle(authToken).then(setShuttle);
  }, 30000);
  
  return () => clearInterval(interval);
}, [authToken]);

// Display shuttle info
return (
  <View>
    {shuttle?.data?.shuttle && (
      <View>
        <Text>{shuttle.data.shuttle.plate_number}</Text>
        <Text>{shuttle.data.driver?.full_name}</Text>
        <Text>{shuttle.data.route?.name}</Text>
        <MapView
          initialRegion={{
            latitude: shuttle.data.last_location?.latitude,
            longitude: shuttle.data.last_location?.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: shuttle.data.last_location?.latitude,
              longitude: shuttle.data.last_location?.longitude,
            }}
            title={shuttle.data.shuttle.plate_number}
          />
        </MapView>
      </View>
    )}
  </View>
);
```

---

## 2. Driver Location Tracking (Driver App)

### Start Tracking Location
```typescript
// 1. Get user's geolocation permission
import * as Location from 'expo-location';

async function startLocationTracking(token: string, shuttleId: number) {
  // Request permission
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access location was denied');
    return;
  }

  // Watch position continuously
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 10, // or 10 meters
    },
    (location) => {
      updateDriverLocation(token, location);
    }
  );

  return subscription; // Save to clean up later
}

// 2. Send location to server
async function updateDriverLocation(
  token: string,
  location: Location.LocationObject
) {
  try {
    const response = await fetch('/api/mobile/driver/location/update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed_kmh: (location.coords.speed || 0) * 3.6, // Convert m/s to km/h
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Location update failed:', data);
    } else {
      console.log('Location saved:', data.data);
    }
  } catch (error) {
    console.error('Error updating location:', error);
  }
}

// 3. Batch upload cached locations when coming back online
async function batchUploadLocations(
  token: string,
  cachedLocations: Array<{lat: number, lon: number, speed?: number, time: string}>
) {
  const response = await fetch('/api/mobile/driver/location/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      locations: cachedLocations.map(loc => ({
        latitude: loc.lat,
        longitude: loc.lon,
        speed_kmh: loc.speed,
        timestamp: loc.time
      }))
    })
  });
  
  const data = await response.json();
  console.log(`Uploaded ${data.data.locations_saved} locations`);
}
```

---

## 3. Trip Status Management (Driver App)

### Start Trip
```typescript
async function startTrip(
  token: string,
  shuttleId: number,
  routeId: number
) {
  const response = await fetch('/api/mobile/driver/trip/start', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      shuttle_id: shuttleId,
      route_id: routeId
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    alert(`Error: ${data.message}`);
  } else {
    console.log('Trip started:', data.data.trip_id);
    return data.data.trip_id;
  }
}
```

### Update Trip Status
```typescript
async function updateTripStatus(
  token: string,
  newStatus: 'idle' | 'en_route' | 'arrived' | 'completed'
) {
  const response = await fetch('/api/mobile/driver/trip/status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      status: newStatus
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Error updating status:', data.errors);
  } else {
    console.log('Status updated to:', data.data.current_status);
  }
}

// Usage
useEffect(() => {
  const statusButtons = [
    { label: 'Idle', status: 'idle' },
    { label: 'En Route', status: 'en_route' },
    { label: 'Arrived', status: 'arrived' },
    { label: 'Completed', status: 'completed' }
  ];
  
  return (
    <View>
      {statusButtons.map(btn => (
        <Button
          key={btn.status}
          title={btn.label}
          onPress={() => updateTripStatus(authToken, btn.status)}
        />
      ))}
    </View>
  );
}, [authToken]);
```

### Get Current Trip
```typescript
async function getCurrentTrip(token: string) {
  const response = await fetch('/api/mobile/driver/trip/current', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.log('No active trip');
    return null;
  }
  
  return data.data;
}

// Usage with polling
useEffect(() => {
  const pollTrip = async () => {
    const trip = await getCurrentTrip(authToken);
    setCurrentTrip(trip);
  };
  
  pollTrip();
  const interval = setInterval(pollTrip, 60000); // Poll every minute
  
  return () => clearInterval(interval);
}, [authToken]);
```

### End Trip
```typescript
async function endTrip(token: string) {
  const response = await fetch('/api/mobile/driver/trip/end', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    alert(`Error: ${data.message}`);
  } else {
    alert('Trip completed');
  }
}
```

---

## 4. Passenger Trip Status View (Passenger Screen)

### Check Trip Status
```typescript
async function watchTripStatus(tripId: number) {
  // No authentication needed for public endpoint
  const response = await fetch(`/api/trip/${tripId}/status`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.error('Trip not found');
    return null;
  }
  
  return response.json();
}

// Usage with polling
useEffect(() => {
  if (!tripId) return;
  
  const pollStatus = async () => {
    const trip = await watchTripStatus(tripId);
    setTripStatus(trip?.data?.status);
  };
  
  pollStatus();
  const interval = setInterval(pollStatus, 15000); // Poll every 15 seconds
  
  return () => clearInterval(interval);
}, [tripId]);

// Display status
const statusColors = {
  'idle': 'gray',
  'en_route': 'blue',
  'arrived': 'green',
  'completed': 'green'
};

return (
  <View>
    <Text>Driver: {tripStatus?.driver.full_name}</Text>
    <Text>Vehicle: {tripStatus?.shuttle.plate_number}</Text>
    <Badge color={statusColors[tripStatus?.status]}>
      {tripStatus?.status.toUpperCase()}
    </Badge>
  </View>
);
```

---

## Error Handling

### Handle Common Errors
```typescript
async function handleApiError(response: Response, data: any) {
  switch (response.status) {
    case 401:
      // Token expired, re-authenticate
      redirectToLogin();
      break;
    
    case 403:
      alert('You do not have permission to perform this action');
      break;
    
    case 404:
      // Resource not found
      if (data.message === 'No active shuttle found') {
        setShuttleMessage('No shuttle is currently operating on this route');
      }
      break;
    
    case 422:
      // Validation error
      const errors = Object.values(data.errors || {}).flat();
      alert('Validation Error:\n' + errors.join('\n'));
      break;
    
    case 409:
      // Conflict (e.g., duplicate active trip)
      alert(data.message);
      break;
    
    default:
      alert('An error occurred. Please try again.');
  }
}
```

---

## Best Practices

1. **Location Permissions**
   - Always request permission before accessing location
   - Handle denial gracefully

2. **Offline Support**
   - Queue location updates when offline
   - Batch upload when connection restored

3. **Rate Limiting**
   - Don't send location more than once per second
   - Use background tasks for continuous tracking

4. **Token Management**
   - Store token securely (AsyncStorage with encryption)
   - Refresh token before expiry
   - Clear token on logout

5. **Polling Intervals**
   - Shuttle updates: 30 seconds (passenger)
   - Location updates: 5 seconds (driver)
   - Trip status: 15 seconds (passenger), 1 minute (driver)

6. **Error Recovery**
   - Implement exponential backoff for retries
   - Show user-friendly error messages
   - Log errors for debugging
