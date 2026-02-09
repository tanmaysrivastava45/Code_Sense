// import { supabase } from '../config/supabase.js';

// export const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'No authorization token provided' });
//     }

//     const token = authHeader.split(' ')[1];

//     // Verify the JWT token with Supabase
//     const { data: { user }, error } = await supabase.auth.getUser(token);

//     if (error || !user) {
//       return res.status(401).json({ error: 'Invalid or expired token' });
//     }

//     // Attach user to request
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     return res.status(401).json({ error: 'Authentication failed' });
//   }
// };

// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../model/User.js';

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: fetch full user from MongoDB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

