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

            const userRole = req.user.Role.name.toLowerCase();
            const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);
            
            if (!isAllowed) {
                return res.status(403).json({ 
                    message: `Forbidden - Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.Role.name}` 
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
