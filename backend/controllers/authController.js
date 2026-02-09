// import { supabase } from '../config/supabase.js';

// export const register = async (req, res) => {
//   try {
//     const { email, password, name } = req.body;

//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           name: name
//         }
//       }
//     });

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.status(201).json({ 
//       message: 'User registered successfully',
//       user: data.user,
//       session: data.session
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Registration failed' });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password
//     });

//     if (error) {
//       return res.status(401).json({ error: error.message });
//     }

//     res.json({ 
//       message: 'Login successful',
//       user: data.user,
//       session: data.session
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     const { error } = await supabase.auth.signOut();
    
//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.json({ message: 'Logout successful' });
//   } catch (error) {
//     res.status(500).json({ error: 'Logout failed' });
//   }
// };

import { User } from '../model/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createSession } from '../utils/sessionManager.js';
dotenv.config();

const SALT_ROUNDS = 10;

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Create a unique session for this login
    const sessionId = createSession(
      user._id.toString(),
      token,
      24 * 60 * 60 * 1000 // 24 hours
    );

    res.json({
      message: 'Login successful',
      token,
      sessionId,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    // In a real application, you would:
    // 1. Invalidate the session/token
    // 2. Clear any server-side session data
    // For now, we just send a success message since JWT tokens are stateless
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};


