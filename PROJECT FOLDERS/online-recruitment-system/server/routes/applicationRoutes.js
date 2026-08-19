import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import { protect, adminOnly, uploadResume } from '../middleware.js';

const router = express.Router();

// @route   POST /api/applications/apply
// @desc    Submit a new job application with resume file upload
router.post('/apply', protect, uploadResume, async (req, res, next) => {
  try {
    const { jobId, coverLetter, experience, education, skills } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Job ID.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This job posting is closed.' });
    }

    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'The deadline for this job has expired.' });
    }

    // Check duplicate application
    const existing = await Application.findOne({ jobId: job._id, applicantId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }

    let resumeFilename = req.file ? req.file.filename : null;
    const profile = await ApplicantProfile.findOne({ userId: req.user._id });

    if (!resumeFilename && profile && profile.resume) {
      resumeFilename = profile.resume;
    }

    if (!resumeFilename) {
      return res.status(400).json({ success: false, message: 'Please upload a resume (PDF/DOC/DOCX).' });
    }

    // Process skills
    let skillsArray = [];
    if (Array.isArray(skills)) skillsArray = skills.filter(Boolean);
    else if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        skillsArray = Array.isArray(parsed) ? parsed : skills.split(',').map((s) => s.trim()).filter(Boolean);
      } catch {
        skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else if (profile && profile.skills) {
      skillsArray = profile.skills;
    }

    const application = await Application.create({
      jobId: job._id,
      applicantId: req.user._id,
      coverLetter: coverLetter || '',
      resume: resumeFilename,
      skills: skillsArray,
      experience: experience || (profile ? profile.experience : ''),
      education: education || (profile ? profile.education : ''),
      status: 'Applied',
      statusHistory: [{ status: 'Applied', note: 'Application submitted successfully.' }],
    });

    if (req.file && profile) {
      profile.resume = req.file.filename;
      await profile.save();
    }

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title company location employmentType salaryMin salaryMax deadline status')
      .populate('applicantId', 'name email phone profileImage');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get all applications submitted by logged-in candidate
router.get('/my-applications', protect, async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { applicantId: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title company location employmentType salaryMin salaryMax deadline status')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/applications/admin/all
// @desc    Get all applications with filters & pagination (Admin Only)
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, jobId, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (jobId && jobId !== 'all') query.jobId = jobId;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    let applications = await Application.find(query)
      .populate('jobId', 'title company location employmentType')
      .populate('applicantId', 'name email phone profileImage')
      .sort({ appliedAt: -1 });

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      applications = applications.filter((app) => {
        const applicantName = app.applicantId?.name?.toLowerCase() || '';
        const applicantEmail = app.applicantId?.email?.toLowerCase() || '';
        const jobTitle = app.jobId?.title?.toLowerCase() || '';
        const company = app.jobId?.company?.toLowerCase() || '';
        return (
          applicantName.includes(searchLower) ||
          applicantEmail.includes(searchLower) ||
          jobTitle.includes(searchLower) ||
          company.includes(searchLower)
        );
      });
    }

    const total = applications.length;
    const paginated = applications.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      limit: limitNum,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/applications/:id
// @desc    Get details of a single application
router.get('/:id', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('applicantId', 'name email phone profileImage createdAt lastLogin loginHistory');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user.role !== 'admin' && application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const profile = await ApplicantProfile.findOne({ userId: application.applicantId._id });
    const appObj = application.toObject();
    appObj.applicantProfile = profile || {};

    res.status(200).json({
      success: true,
      data: {
        ...appObj,
        application: appObj,
        profile: profile || {},
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application hiring stage / status (Admin Only)
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status stage.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    if (note) application.adminNotes = note;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status transitioned to ${status}`,
    });

    await application.save();

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title company location')
      .populate('applicantId', 'name email phone profileImage');

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
