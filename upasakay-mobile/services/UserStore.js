/**
 * 1. API CONFIGURATION
 * Points to the Heroku-deployed backend.
 * Override locally via EXPO_PUBLIC_API_URL in upasakay-mobile/.env
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://upasakay-abc142adb2d4.herokuapp.com/api";

/**
 * 2. SESSION TRACKER
 * Holds the object of the user currently logged into the app.
 */
export let currentUser = null;

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

            setCurrentUser({
                 id: payload.user?.id,
                passenger_id: payload.passenger?.id,
                driver_id: payload.driver?.id,
                role: payload.role || (payload.driver ? "driver" : "passenger"),
                full_name: payload.user?.full_name || payload.driver?.full_name || payload.passenger?.full_name || "User",
                email: payload.user?.email,
                passenger_type: payload.passenger?.passenger_type || "student",
                shuttle_id: payload.driver?.shuttle_id,
                shuttle_code: payload.driver?.shuttle_code,
                route_id: payload.driver?.route_id,
                token: result.token,
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

export const setCurrentUser = (user) => {
    currentUser = user;
};

/**
 * 5. LOGOUT LOGIC
 */
export const logoutUser = () => {
    currentUser = null;
    return { success: true };
};