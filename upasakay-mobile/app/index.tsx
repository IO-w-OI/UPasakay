import { Redirect } from 'expo-router';

import Login from '../screens/Login';
import { currentUser } from '../services/UserStore';

// _layout.tsx restores the persisted session before this route mounts, so
// currentUser is already populated here if the user was previously logged in.
// Routing is driven by the role stored in the session (set from the backend
// auth payload), consistent with Login.js.
export default function Index() {
    if (currentUser?.token) {
        const isDriver = currentUser.role === 'driver';
        if (isDriver) {
            return <Redirect href="/(tabs)/Drivers/DriverHome" />;
        }
        // Passengers awaiting admin approval stay on the "Account Under
        // Review" screen. Checked with an explicit `=== false` so sessions
        // saved before this field existed aren't bounced out.
        if (currentUser.approved === false) {
            return <Redirect href="/UserOnboarding4" />;
        }
        return <Redirect href="/(tabs)/Users/UserHome" />;
    }

    return <Login />;
}
