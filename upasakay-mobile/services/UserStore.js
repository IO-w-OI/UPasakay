// 1. This is your temporary "Database"
// It functions exactly like your "Recents" array.
export let usersArray = [
    {
        name: "Kyle Dominic D. Olmedo",
        email: "kdolmedo@up.edu.ph",
        password: "password123",
        role: "Student"
    }
];

// 2. This tracks the current session
export let currentUser = null;

/**
 * SIGNUP: Adds a new student to the array
 * @param {string} name - From the 'Full Name' input
 * @param {string} email - From the 'Email' input
 * @param {string} password - From the 'Password' input
 */
export const addUser = (name, email, password) => {
    // Check if the student already exists in the list
    const exists = usersArray.find(u => u.email === email);
    
    if (exists) {
        return { success: false, message: "This UP email is already registered!" };
    }

    // Create the new object (The "Recents" style)
    const newUser = {
        name: name,
        email: email,
        password: password,
        role: "Student"
    };

    // Push into the array
    usersArray.push(newUser);
    
    // Auto-set as active user for immediate login
    currentUser = newUser;

    console.log("--- UserStore Updated ---");
    console.log("New Student:", name);
    console.log("Total Users in Memory:", usersArray.length);
    
    return { success: true };
};

/**
 * LOGIN: Validates credentials against the array
 */
export const validateUser = (email, password) => {
    const user = usersArray.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user; // Store who is logged in
        return { success: true, user };
    }
    
    return { success: false, message: "Invalid credentials." };
};