// backend/middleware/verifyRole.js

const verifyRole = (...allowedRoles) => {

    return (req, res, next) => {

        // authenticateToken must run before this and set req.user.
        if (!req.user || !req.user.role) {

            return res.status(401).json({
                error: 'Access token required'
            });

        }

        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({
                error: 'You do not have permission to perform this action'
            });

        }

        next();

    };

};

module.exports = verifyRole;