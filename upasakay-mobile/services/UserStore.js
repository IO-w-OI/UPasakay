/**
 * 1. DATABASE
 * Stores all registered users in memory for the current session.
 */

const API_URL = "https://upasakay-abc142adb2d4.herokuapp.com/api";

export let currentUser = null;

export let usersArray = [
    {
        name: "Kyle Dominic D. Olmedo",
        email: "kdolmedo@up.edu.ph",
        password: "password123",
        phone: "09123456789",
        passenger_type: "student",
        Department_office: "College of Science"
    },
    {
        name: "Norvel Lawrence P. Roxas",
        email: "nlproxas@up.edu.ph",
        password: "password123",
        phone: "09987654321",
        passenger_type: "Driver",
        Department_office: "Campus Maintenance Office (CMO)"
    }
];

/**
 * 2. SESSION TRACKER
 * Holds the object of the user currently logged into the app.
 */
export let currentUser = null;

/**
 * 3. SIGNUP LOGIC
 * Adds a new user with conditional roles and departments.
 * * @param {string} name - User's full name
 * @param {string} email - UP Mail address
 * @param {string} password - Account password
 * @param {string} phone - Mobile number
 * @param {string} passenger_type - [student, faculty, employee, Other]
 * @param {string} Department_office - Specific office or college based on type
 */
export const addUser = async (name, email, password, phone, passenger_type, Department_office) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password,
                phone,
                passenger_type,
                Department_office
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: "Could not connect to Heroku." };
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user; // Laravel should return the user object
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || "Login failed" };
        }
    } catch (error) {
        return { success: false, message: "Network error. Is the server awake?" };
    }
};

/**
 * 5. LOGOUT LOGIC
 */
export const logoutUser = () => {
    currentUser = null;
    return { success: true };
};