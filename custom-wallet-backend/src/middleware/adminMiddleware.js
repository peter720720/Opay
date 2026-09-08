export const isAdmin = (req, res, next) => {
    // This gatekeeper relies on 'protect' middleware running first to populate the req.user object
    if (req.user && req.user.role === 'admin') {
        return next(); // The user is confirmed an admin, proceed safely
    } else {
        return res.status(403).json({ 
            error: 'Access denied. This administrative workspace is restricted to authorized credentials only.' 
        });
    }
};
