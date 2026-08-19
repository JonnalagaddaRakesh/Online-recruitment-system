import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import applicantRoutes from './routes/applicantRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Unified error handlers
import { notFoundHandler, errorHandler } from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Connect to Database
await connectDB();

// Auto-seed if database is empty for instant demo readiness
try {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('🌱 Database is empty. Seeding demo records...');
    await seedDatabase();
  }
} catch (seedErr) {
  console.warn('⚠️ Auto-seed notice:', seedErr.message);
}

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resumes & avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', timestamp: new Date().toISOString() });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/profile', applicantRoutes); // Alias for candidate profile
app.use('/api/dashboard', dashboardRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Recruitment System Server running on port ${PORT}`);
  console.log(`👉 API Base: http://localhost:${PORT}/api`);
});
