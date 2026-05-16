import { Redirect } from 'expo-router';

import Login from '../screens/Login';
import { currentUser } from '../services/UserStore';

// _layout.tsx restores the persisted session before this route mounts, so
// currentUser is already populated here if the user was previously logged in.
// Routing heuristic mirrors Login.js (email domain); Feature D will replace
// both with the role returned in the auth payload.
export default function Index() {
    if (currentUser?.token) {
        const isDriver = (currentUser.email ?? '').toLowerCase().endsWith('@upasakay.com');
        return (
            <Redirect href={isDriver ? '/(tabs)/Drivers/DriverHome' : '/(tabs)/Users/UserHome'} />
        );
    }

    return <Login />;
}
