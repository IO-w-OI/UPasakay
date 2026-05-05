/**
 * 1. TEMPORARY DATABASE
 * Stores all registered users in memory for the current session.
 */
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
export const addUser = (name, email, password, phone, passenger_type, Department_office) => {
    // Check for existing account
    const exists = usersArray.find(u => u.email === email);
    
    if (exists) {
        return { success: false, message: "This UP email is already registered!" };
    }

    // Create the user object with the new schema
    const newUser = {
        name: name,
        email: email,
        password: password,
        phone: phone,
        passenger_type: passenger_type,
        Department_office: Department_office
    };

    // Save to the temporary array
    usersArray.push(newUser);
    
    // Automatically set as active user (Login upon signup)
    currentUser = newUser;

    console.log("--- UPSakay: New User Registered ---");
    console.log(`Name: ${name}`);
    console.log(`Type: ${passenger_type}`);
    console.log(`Office/College: ${Department_office}`);
    console.log(`Total Database Count: ${usersArray.length}`);
    
    return { success: true };
};

/**
 * 4. LOGIN LOGIC
 * Checks credentials and updates the currentUser session.
 */
export const validateUser = (email, password) => {
    const user = usersArray.find(u => u.email === email);
    
    if (!user) return { success: false, code: 'AUTH_NO_ACCOUNT' };
    if (user.password !== password) return { success: false, code: 'AUTH_WRONG_PASSWORD' };
    
    currentUser = user; 
    return { success: true, user };
};

/**
 * 5. LOGOUT LOGIC
 */
export const logoutUser = () => {
    currentUser = null;
    return { success: true };
};