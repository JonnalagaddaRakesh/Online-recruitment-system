import express from 'express';
import User from '../models/User.js';
import ApplicantProfile from '../models/ApplicantProfile.js';
import Application from '../models/Application.js';
import { protect, adminOnly, uploadResume } from '../middleware.js';

const router = express.Router();

// Helper to get or create profile
const getOrCreateProfile = async (user) => {
  let profile = await ApplicantProfile.findOne({ userId: user._id });
  if (!profile) {
    profile = await ApplicantProfile.create({
      userId: user._id,
      fullName: user.name,
      email: user.email,
      phone: user.phone || '',
    });
  }
  return profile;
};

// @route   GET /api/applicants/profile/me & GET /api/profile/me & GET /api/profile
// @desc    Get logged in applicant's profile
const getMyProfileHandler = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user);
    res.status(200).json({
      success: true,
      data: { user: req.user, profile },
    });
  } catch (error) {
    next(error);
  }
};

router.get('/profile/me', protect, getMyProfileHandler);
router.get('/me', protect, getMyProfileHandler);

// @route   PUT /api/applicants/profile/me & PUT /api/profile/me
// @desc    Update logged in applicant's profile
const updateMyProfileHandler = async (req, res, next) => {
  try {
    const { fullName, phone, dateOfBirth, gender, address, city, state, education, experience, skills } = req.body;

    let profile = await ApplicantProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new ApplicantProfile({ userId: req.user._id });
    }

    if (fullName) profile.fullName = fullName;
    if (phone) profile.phone = phone;
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (gender) profile.gender = gender;
    if (address) profile.address = address;
    if (city) profile.city = city;
    if (state) profile.state = state;
    if (education) profile.education = education;
    if (experience) profile.experience = experience;

    if (skills) {
      if (Array.isArray(skills)) profile.skills = skills.filter(Boolean);
      else if (typeof skills === 'string') {
        try {
          const parsed = JSON.parse(skills);
          profile.skills = Array.isArray(parsed) ? parsed : skills.split(',').map((s) => s.trim()).filter(Boolean);
        } catch {
          profile.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (req.file) {
      profile.resume = req.file.filename;
    }

    await profile.save();

    // Update name/phone on User
    const user = await User.findById(req.user._id);
    if (fullName) user.name = fullName;
    if (phone) user.phone = phone;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

router.put('/profile/me', protect, uploadResume, updateMyProfileHandler);
router.put('/me', protect, uploadResume, updateMyProfileHandler);

// @route   GET /api/applicants
// @desc    Get all applicants with application counts, search, and login timestamps (Admin Only)
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const applicants = await User.find({ role: 'applicant' }).select('-password').sort({ createdAt: -1 });
    const userIds = applicants.map((a) => a._id);

    const profiles = await ApplicantProfile.find({ userId: { $in: userIds } });
    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId.toString(), p));

    const applications = await Application.find({ applicantId: { $in: userIds } });
    const applicationCountMap = new Map();
    applications.forEach((app) => {
      const uid = app.applicantId.toString();
      applicationCountMap.set(uid, (applicationCountMap.get(uid) || 0) + 1);
    });

    let applicantData = applicants.map((user) => {
      const profile = profileMap.get(user._id.toString()) || {};
      const applicationsCount = applicationCountMap.get(user._id.toString()) || 0;
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || profile.phone || '',
        education: profile.education || 'Not specified',
        skills: profile.skills || [],
        experience: profile.experience || 'Not specified',
        resume: profile.resume || '',
        profileImage: user.profileImage || profile.profileImage || '',
        applicationsCount,
        registeredDate: user.createdAt,
        lastLogin: user.lastLogin || user.createdAt,
        loginHistory: user.loginHistory || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      applicantData = applicantData.filter((a) => {
        return (
          a.name.toLowerCase().includes(searchLower) ||
          a.email.toLowerCase().includes(searchLower) ||
          a.phone.toLowerCase().includes(searchLower) ||
          a.education.toLowerCase().includes(searchLower) ||
          a.skills.some((s) => s.toLowerCase().includes(searchLower))
        );
      });
    }

    const total = applicantData.length;
    const paginated = applicantData.slice(skip, skip + limitNum);

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

// @route   GET /api/applicants/:id
// @desc    Get single applicant dossier with applications & login history (Admin Only)
router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'applicant') {
      return res.status(404).json({ success: false, message: 'Applicant not found.' });
    }

    const profile = await ApplicantProfile.findOne({ userId: user._id });
    const applications = await Application.find({ applicantId: user._id })
      .populate('jobId', 'title company location employmentType salaryMin salaryMax deadline status')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: { user, profile: profile || {}, applications },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
