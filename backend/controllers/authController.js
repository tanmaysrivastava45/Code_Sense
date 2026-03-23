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
import crypto from 'crypto';
import { createSession } from '../utils/sessionManager.js';
import {
  isEmailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../utils/emailService.js';
dotenv.config();

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function buildVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function buildVerificationUrl(token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`;
}

function buildResetPasswordUrl(token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
}

async function issueVerificationToken(user) {
  user.emailVerificationToken = buildVerificationToken();
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  await user.save();
  return user.emailVerificationToken;
}

async function sendVerificationEmailToUser(user) {
  const token =
    user.emailVerificationToken && user.emailVerificationExpires > new Date()
      ? user.emailVerificationToken
      : await issueVerificationToken(user);

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationUrl: buildVerificationUrl(token),
  });
}

async function issuePasswordResetToken(user) {
  user.passwordResetToken = buildVerificationToken();
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
  await user.save();
  return user.passwordResetToken;
}

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      emailVerificationToken: buildVerificationToken(),
      emailVerificationExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    });
    await user.save();

    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        await sendVerificationEmailToUser(user);
        emailSent = true;
      } catch (emailError) {
        console.error('Verification email send error:', emailError);
      }
    }

    res.status(201).json({
      message: emailSent
        ? 'User registered successfully. Please verify your email before logging in.'
        : 'User registered successfully. Email sending is unavailable right now, please use resend verification later.',
      emailSent,
      requiresVerification: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
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

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
    }

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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({ error: 'Email service is not configured' });
    }

    await issueVerificationToken(user);
    await sendVerificationEmailToUser(user);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({ error: 'Email service is not configured' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const resetToken = await issuePasswordResetToken(user);
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl: buildResetPasswordUrl(resetToken),
    });

    res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires'
    );
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


