const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Unauthorized - Please login first' 
                });
            }

            if (!req.user.Role) {
                return res.status(403).json({ 
                    message: 'Forbidden - No role assigned to user' 
                });
            }

            const userRole = req.user.Role.name;
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ 
                    message: `Forbidden - Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}` 
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ message: 'Internal server error during role verification' });
        }
    };
};

module.exports = checkRole;
