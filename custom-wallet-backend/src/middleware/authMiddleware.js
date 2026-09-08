import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Check if the incoming request contains a Bearer token in the headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header string: "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // 2. Decode and verify the token signature against our JWT_SECRET key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user attached to this session token and attach them to the request object
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ error: 'User account no longer exists.' });
            }

            // Move safely into the controller logic
            return next();
        } catch (error) {
            console.error('⚠️ Session Authentication Failure:', error.message);
            return res.status(401).json({ error: 'Not authorized, login session has expired or failed verification.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Missing security token headers.' });
    }
};
