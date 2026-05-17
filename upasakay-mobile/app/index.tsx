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
        return (
            <Redirect href={isDriver ? '/(tabs)/Drivers/DriverHome' : '/(tabs)/Users/UserHome'} />
        );
    }

    return <Login />;
}
