/**
 * 1. API CONFIGURATION
 * Using your current Mac IP from the Expo terminal.
 */
const API_URL = "http://172.20.10.4:8000/api";

/**
 * 2. SESSION TRACKER
 * Holds the object of the user currently logged into the app.
 */
export let currentUser = null;

/**
 * 3. SIGNUP LOGIC
 * Adds a new user to the PostgreSQL database.
 */
export const addUser = async (name, email, password, phone, passenger_type, Department_office) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify({
                full_name: name,         
                email: email,
                password: password,      
                password_confirmation: password, 
                passenger_type: 'student', 
                phone: phone, 
                department_office: Department_office
            })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, message: data.message || "Registration failed" };
        }
    } catch (error) {
        return { success: false, message: "Network error. Check your Mac's IP." };
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

            // We map the API data to the keys the Mobile App expects (like 'full_name')
            setCurrentUser({
                full_name: payload.user?.full_name || payload.passenger?.full_name || "User",
                email: payload.user?.email,
                passenger_type: payload.passenger?.passenger_type || "student"
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