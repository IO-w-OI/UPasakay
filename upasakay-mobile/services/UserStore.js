import * as SecureStore from 'expo-secure-store';

/**
 * 1. API CONFIGURATION
 * Points to the Heroku-deployed backend.
 * Override locally via EXPO_PUBLIC_API_URL in upasakay-mobile/.env
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://upasakay-abc142adb2d4.herokuapp.com/api";

/**
 * 2. SESSION TRACKER
 * Holds the object of the user currently logged into the app.
 * Mirrored to SecureStore so the session survives app restarts.
 */
export let currentUser = null;

const SESSION_KEY = "upasakay.session";

/**
 * Persists the in-memory session to encrypted secure storage.
 * Fire-and-forget: callers don't need to await it, but it is awaitable.
 */
const persistSession = async () => {
    try {
        if (currentUser) {
            await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(currentUser));
        } else {
            await SecureStore.deleteItemAsync(SESSION_KEY);
        }
    } catch (error) {
        console.warn("Failed to persist session:", error?.message ?? error);
    }
};

/**
 * Restores a previously persisted session on app boot.
 * Returns the restored user (or null if none / corrupt).
 */
export const restoreSession = async () => {
    try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
            currentUser = parsed;
            return currentUser;
        }
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
    } catch (error) {
        console.warn("Failed to restore session:", error?.message ?? error);
        return null;
    }
};

/**
 * 3. SIGNUP LOGIC
 * Adds a new user to the PostgreSQL database.
 */
export const addUser = async (full_name, email, password, phone, passenger_type, department_office) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                full_name: full_name,
                email: email,
                password: password,
                password_confirmation: password,
                passenger_type: passenger_type,
                phone: phone,
                department_office: department_office
            })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, message: data.message || "Registration failed" };
        }
    } catch (error) {
        return { success: false, message: "Network error. Check your internet connection." };
    }
};

/**
 * 4. LOGIN LOGIC
 * Checks credentials and updates the currentUser session.
 */
export const validateUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const payload = result.data;

            await setCurrentUser({
                id: payload.user?.id,
                passenger_id: payload.passenger?.id,       // used for Pusher channel & pickup requests
                full_name: payload.user?.full_name || payload.passenger?.full_name || "User",
                email: payload.user?.email,
                passenger_type: payload.passenger?.passenger_type || "student",
                token: result.token,                        // Sanctum token for API calls
            });

            console.log("Login Success! Session stored for:", currentUser.full_name);
            return { success: true, user: currentUser };
        } else {
            return { success: false, message: result.message || "Invalid credentials" };
        }
    } catch (error) {
        return { success: false, message: "Network error. Check server." };
    }
};

/**
 * Updates the in-memory session and mirrors it to secure storage.
 */
export const setCurrentUser = async (user) => {
    currentUser = user;
    await persistSession();
};

/**
 * 5. LOGOUT LOGIC
 * Clears the in-memory session and the persisted copy.
 */
export const logoutUser = async () => {
    currentUser = null;
    await persistSession();
    return { success: true };
};
