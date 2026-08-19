import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. JWT Authentication & Authorization
// ==========================================
export const protect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_recruitment_jwt_token_key_2026_secure');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found for this token.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
  }
};

// ==========================================
// 2. Multer File Uploads (Resumes & Avatars)
// ==========================================
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAvatar = file.fieldname === 'profileImage';
    const folder = path.join(__dirname, isAvatar ? 'uploads/profiles' : 'uploads/resumes');
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const isAvatar = file.fieldname === 'profileImage';
    const prefix = isAvatar ? 'avatar' : 'resume';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (validExts.includes(ext)) return cb(null, true);
    return cb(new Error('Only JPEG, PNG, or WebP images are allowed for avatars.'));
  }
  
  // Resumes: PDF, DOC, DOCX
  const validResumeExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (validResumeExts.includes(ext)) return cb(null, true);
  return cb(new Error('Only PDF, DOC, or DOCX files are allowed for resumes.'));
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('resume');

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('profileImage');

// ==========================================
// 3. Centralized Error Handlers
// ==========================================
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - [${req.method}] ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid record ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry: A record with this ${field} already exists.`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
