const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal server configuration error' });
        }
        const decoded = jwt.verify(token, secret);
        
        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ message: 'Account has been banned' });
        }

        

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
