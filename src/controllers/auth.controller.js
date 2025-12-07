const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

// POST /auth/register - Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать name, email и password'
            });
        }

        // Validate role if provided
        const validRoles = ['admin', 'user', 'guest'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Роль должна быть: admin, user или guest'
            });
        }

        // Register user
        const result = await authModel.register({ name, email, password, role });

        if (result.error) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            data: result
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при регистрации пользователя'
        });
    }
};

// POST /auth/login - Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать email и password'
            });
        }

        // Find user by email
        const user = authModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Verify password
        const isPasswordValid = await authModel.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Успешный вход',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе в систему'
        });
    }
};

// GET /auth/me - Get current user info
const getMe = (req, res) => {
    try {
        const user = authModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении данных пользователя'
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};
