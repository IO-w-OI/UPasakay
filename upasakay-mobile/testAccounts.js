// This is your "Users Table" in memory
export let usersArray = [
    {
        name: "Kyle Dominic D. Olmedo",
        email: "kdolmedo@up.edu.ph",
        password: "password123",
        role: "Student"
    }
];

// SIGNUP: Logic to add a new user
export const addUser = (name, email, password) => {
    // Check if email already exists
    const exists = usersArray.find(u => u.email === email);
    if (exists) return { success: false, message: "User already registered!" };

    const newUser = { name, email, password, role: "Student" };
    usersArray.push(newUser); 
    console.log("Current Users in Memory:", usersArray);
    return { success: true };
};

// LOGIN: Logic to verify a user
export const validateUser = (email, password) => {
    const user = usersArray.find(u => u.email === email && u.password === password);
    return user || null;
};