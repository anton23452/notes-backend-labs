const bcrypt = require('bcryptjs');

// In-memory storage for users
let users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$rZ5J5YQKxVZ5YQKxVZ5YQe5YQKxVZ5YQKxVZ5YQKxVZ5YQKxVZ5YQ', // password: admin123
        role: 'admin'
    },
    {
        id: 2,
        name: 'Regular User',
        email: 'user@example.com',
        password: '$2a$10$rZ5J5YQKxVZ5YQKxVZ5YQe5YQKxVZ5YQKxVZ5YQKxVZ5YQKxVZ5YQ', // password: user123
        role: 'user'
    }
];

let nextUserId = 3;

// Find user by email
const findByEmail = (email) => {
    return users.find(user => user.email === email);
};

// Find user by id
const findById = (id) => {
    return users.find(user => user.id === parseInt(id));
};

// Register new user
const register = async (userData) => {
    // Check if user already exists
    const existingUser = findByEmail(userData.email);
    if (existingUser) {
        return { error: 'Пользователь с таким email уже существует' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user
    const newUser = {
        id: nextUserId++,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user' // Default role is 'user'
    };

    users.push(newUser);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Get all users (for admin)
const getAllUsers = () => {
    return users.map(({ password, ...user }) => user);
};

module.exports = {
    findByEmail,
    findById,
    register,
    verifyPassword,
    getAllUsers
};
