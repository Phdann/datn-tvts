const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ message: 'Account has been banned' });
        }

        await user.update({ last_login: new Date() });

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
