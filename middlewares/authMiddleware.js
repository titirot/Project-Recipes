const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
        req.user = decoded;
        return next();
    } catch (_err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const optionalAuthenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
        req.user = decoded;
    } catch (_err) {
        // For optional auth, ignore invalid token and continue as guest.
    }

    return next();
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication is required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You do not have permission for this action' });
    }
    return next();
};

const authorizeSelfOrAdmin = (paramKey = 'id') => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication is required' });
    }
    if (req.user.role === 'admin' || req.user.id === req.params[paramKey]) {
        return next();
    }
    return res.status(403).json({ message: 'You can perform this action only on your own account' });
};

module.exports = { authenticate, optionalAuthenticate, authorizeRoles, authorizeSelfOrAdmin };
