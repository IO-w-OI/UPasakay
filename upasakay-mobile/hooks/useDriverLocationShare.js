import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { currentUser, API_URL } from '../services/UserStore';

// Keep the SAME task name as the previous DriverMap.js so a registered
// background task / OS permission grant is not orphaned across the refactor.
const LOCATION_TASK = 'driver-location-task';

// Latest known position per driver, keyed by email — read by other screens.
export const driverLocations = {};

function getDriverId() {
  return currentUser?.email ?? 'driver-unknown';
}

function sendLocationToBackend(latitude, longitude, speedMs) {
  if (!currentUser?.token || !currentUser?.id) return;
  fetch(`${API_URL}/driver/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${currentUser.token}`,
    },
    body: JSON.stringify({
      user_id: currentUser.id,
      latitude,
      longitude,
      speed_kmh: parseFloat(((speedMs ?? 0) * 3.6).toFixed(2)),
    }),
  }).catch((err) => console.warn('[GPS] send failed:', err));
}

// Background GPS task — defined once at module load, as Expo requires.
TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.log('[LOCATION_TASK] error', error);
    return;
  }
  if (!data) return;
  const { locations } = data;
  if (!locations?.length) return;
  const { latitude, longitude, speed, heading } = locations[0].coords;
  const id = getDriverId();
  driverLocations[id] = { latitude, longitude, speed: speed ?? 0, heading: heading ?? 0, updatedAt: Date.now() };
  sendLocationToBackend(latitude, longitude, speed);
});

/**
 * Drives foreground + background GPS sharing for the on-duty driver.
 * This replaces the start/stop UI that used to live on the Map tab —
 * the On-Duty toggle (and trip screen) call start()/stop() instead.
 */
export function useDriverLocationShare() {
  const [sharing, setSharing] = useState(false);
  const [coords, setCoords] = useState(null);
  const watcherRef = useRef(null);

  const start = useCallback(async () => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      Alert.alert('Permission needed', 'Enable location access to share your position with passengers.');
      return false;
    }

    try {
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg === 'granted') {
        const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
        if (!alreadyStarted) {
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
      }
    } catch (e) {
      console.log('background perm error', e);
    }

    watcherRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (loc) => {
        const { latitude, longitude, speed, heading } = loc.coords;
        setCoords({ latitude, longitude });
        sendLocationToBackend(latitude, longitude, speed);
        const id = getDriverId();
        driverLocations[id] = { latitude, longitude, speed: speed ?? 0, heading: heading ?? 0, updatedAt: Date.now() };
      }
    );

    setSharing(true);
    return true;
  }, []);

  const stop = useCallback(async () => {
    try {
      watcherRef.current?.remove();
      watcherRef.current = null;
    } catch {}
    try {
      const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
      if (started) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    } catch {}
    setSharing(false);
  }, []);

  // Safety net: stop watching if the owning screen unmounts.
  useEffect(() => {
    return () => {
      try {
        watcherRef.current?.remove();
        watcherRef.current = null;
      } catch {}
    };
  }, []);

  return { sharing, coords, start, stop };
}

export default useDriverLocationShare;
