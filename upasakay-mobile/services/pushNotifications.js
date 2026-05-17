import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiDelete, apiPost } from './apiClient';

/**
 * Push notification helper.
 *
 * Uses Expo Push (covers FCM + APNs, works in Expo Go for dev). The Expo push
 * token is sent to the Laravel backend (/device-tokens) so the server can
 * fan out pickup alerts, ride updates and announcements to this device.
 *
 * NOTE: On SDK 53+ getExpoPushTokenAsync() needs an EAS projectId. Run
 * `eas init` (or set expo.extra.eas.projectId in app.json) once for the
 * project; until then this no-ops with a warning instead of crashing.
 */

let cachedExpoToken = null;

export const getCachedExpoToken = () => cachedExpoToken;

export const registerForPushNotifications = async () => {
    try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return null;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        }

        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;

        if (!projectId) {
            console.warn(
                'Push: no EAS projectId found — run `eas init`. Skipping token registration.'
            );
            return null;
        }

        const { data: expoToken } = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!expoToken) {
            return null;
        }

        cachedExpoToken = expoToken;

        await apiPost('/device-tokens', {
            expo_token: expoToken,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });

        return expoToken;
    } catch (error) {
        console.warn('Push registration failed:', error?.message ?? error);
        return null;
    }
};

/**
 * Remove this device's token from the backend (called on logout).
 */
export const unregisterPushNotifications = async () => {
    if (!cachedExpoToken) return;
    try {
        await apiDelete('/device-tokens', { body: { expo_token: cachedExpoToken } });
    } catch {
        // best-effort; logout proceeds regardless
    }
    cachedExpoToken = null;
};

/**
 * Maps a notification's data.type to the screen the user should land on
 * when they tap it.
 */
export const routeForNotificationData = (data) => {
    switch (data?.type) {
        case 'pickup_request':
            return '/(tabs)/Drivers/DriverHome';
        case 'ride_accepted':
        case 'ride_completed':
            return '/UserBooking';
        case 'announcement':
            return '/(tabs)/Users/UserHome';
        case 'account_approved':
            // The session still says "pending" until the next login, so send
            // the tap to the login screen to refresh approval state.
            return '/';
        default:
            return null;
    }
};
