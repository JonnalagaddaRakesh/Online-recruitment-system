import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import { protect } from '../middleware.js';

const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_recruitment_jwt_token_key_2026_secure', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new applicant or admin
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: emailNormalized });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const now = new Date();
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).replace(/^.*:/, '') || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Browser Client';
    const assignedRole = role === 'admin' ? 'admin' : 'applicant';

    const user = await User.create({
      name: name.trim(),
      email: emailNormalized,
      password,
      role: assignedRole,
      phone: phone || '',
      lastLogin: now,
      loginHistory: [
        {
          timestamp: now,
          ipAddress: clientIp,
          userAgent: userAgent.slice(0, 150),
        },
      ],
    });

    if (assignedRole === 'applicant') {
      await ApplicantProfile.create({
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & capture login timestamp
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const now = new Date();
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).replace(/^.*:/, '') || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    user.lastLogin = now;
    if (!user.loginHistory) user.loginHistory = [];
    user.loginHistory.unshift({
      timestamp: now,
      ipAddress: clientIp,
      userAgent: userAgent.slice(0, 150),
    });

    if (user.loginHistory.length > 25) {
      user.loginHistory = user.loginHistory.slice(0, 25);
    }

    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user profile & login history
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

export default router;
