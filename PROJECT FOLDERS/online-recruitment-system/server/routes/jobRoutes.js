import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { protect, adminOnly } from '../middleware.js';

const router = express.Router();

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Optional auth helper to attach user if token provided without rejecting guests
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = (await import('jsonwebtoken')).default;
      const User = (await import('../models/User.js')).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_recruitment_jwt_token_key_2026_secure');
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Guest browsing allowed
  }
  next();
};

// @route   GET /api/jobs
// @desc    Get all jobs with search, filters, sorting, and pagination
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search,
      location,
      employmentType,
      status,
      minSalary,
      maxSalary,
      experience,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter status
    if (status && status !== 'all') {
      query.status = status;
    } else if (!req.user || req.user.role !== 'admin') {
      query.status = 'Active';
    }

    // Keyword Search across title, company, location, skills, description
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const searchRegex = new RegExp(escaped, 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { skills: searchRegex },
        { description: searchRegex },
        { requirements: searchRegex },
        { responsibilities: searchRegex },
      ];
    }

    // Location filter
    if (location && location.trim() && location !== 'all') {
      const escapedLoc = escapeRegex(location.trim());
      query.location = new RegExp(escapedLoc, 'i');
    }

    // Employment type filter
    if (employmentType && employmentType !== 'all') {
      query.employmentType = employmentType;
    }

    // Experience filter
    if (experience && experience !== 'all') {
      const escapedExp = escapeRegex(experience.trim());
      query.experienceRequired = new RegExp(escapedExp, 'i');
    }

    // Salary filters
    if (minSalary && Number(minSalary) > 0) query.salaryMax = { $gte: Number(minSalary) };
    if (maxSalary && Number(maxSalary) > 0) query.salaryMin = { $lte: Number(maxSalary) };

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'salary_desc') sortOption = { salaryMax: -1, createdAt: -1 };
    else if (sort === 'salary_asc') sortOption = { salaryMin: 1, createdAt: -1 };
    else if (sort === 'deadline') sortOption = { deadline: 1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // If logged in applicant, annotate application status
    let userApplications = [];
    if (req.user && req.user.role === 'applicant') {
      const jobIds = jobs.map((j) => j._id);
      userApplications = await Application.find({
        applicantId: req.user._id,
        jobId: { $in: jobIds },
      }).select('jobId status appliedAt');
    }

    const appliedJobMap = new Map();
    userApplications.forEach((app) => {
      appliedJobMap.set(app.jobId.toString(), {
        hasApplied: true,
        applicationId: app._id,
        applicationStatus: app.status,
        appliedAt: app.appliedAt,
      });
    });

    const jobsWithApplicationState = jobs.map((job) => {
      const jobObj = job.toObject();
      const appInfo = appliedJobMap.get(job._id.toString());
      return {
        ...jobObj,
        hasApplied: Boolean(appInfo),
        applicationInfo: appInfo || null,
        isExpired: new Date(job.deadline) < new Date(),
      };
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      limit: limitNum,
      data: jobsWithApplicationState,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job details
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const jobObj = job.toObject();
    jobObj.isExpired = new Date(job.deadline) < new Date();

    if (req.user && req.user.role === 'applicant') {
      const existingApplication = await Application.findOne({
        jobId: job._id,
        applicantId: req.user._id,
      });
      jobObj.hasApplied = Boolean(existingApplication);
      jobObj.application = existingApplication || null;
    } else {
      jobObj.hasApplied = false;
      jobObj.application = null;
    }

    res.status(200).json({ success: true, data: jobObj });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/jobs
// @desc    Create a new job posting (Admin Only)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      experienceRequired,
      educationRequired,
      vacancies,
      deadline,
      status,
    } = req.body;

    if (!title || !company || !description || !requirements || !responsibilities || !location || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required job fields.',
      });
    }

    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.filter((s) => s && s.trim());
    } else if (typeof skills === 'string') {
      skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      description,
      requirements,
      responsibilities,
      skills: skillsArray,
      location: location.trim(),
      employmentType: employmentType || 'Full Time',
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      experienceRequired: experienceRequired || '0-1 Years',
      educationRequired: educationRequired || "Bachelor's Degree",
      vacancies: Number(vacancies) || 1,
      deadline: new Date(deadline),
      status: status || 'Active',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job posting (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const updates = { ...req.body };
    if (updates.skills) {
      if (Array.isArray(updates.skills)) {
        updates.skills = updates.skills.filter((s) => s && s.trim());
      } else if (typeof updates.skills === 'string') {
        updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (updates.salaryMin !== undefined) updates.salaryMin = Number(updates.salaryMin) || 0;
    if (updates.salaryMax !== undefined) updates.salaryMax = Number(updates.salaryMax) || 0;
    if (updates.vacancies !== undefined) updates.vacancies = Number(updates.vacancies) || 1;
    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job posting & cascade delete applications (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    await Application.deleteMany({ jobId: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
