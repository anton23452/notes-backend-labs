const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Токен не предоставлен'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Токен истек'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Недействительный токен'
        });
    }
};

// Check if user has required role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Необходима аутентификация'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа'
            });
        }

        next();
    };
};

// Check if user is owner of resource or admin
const isOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Необходима аутентификация'
        });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    // Check if user is owner (will be validated in controller)
    req.checkOwnership = true;
    next();
};

module.exports = {
    verifyToken,
    checkRole,
    isOwnerOrAdmin
};
