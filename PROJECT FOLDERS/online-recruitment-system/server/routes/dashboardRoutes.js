import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get complete dashboard analytics, KPI metrics, and charts data
router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const closedJobs = await Job.countDocuments({ status: 'Closed' });
    const totalApplications = await Application.countDocuments();
    const totalApplicants = await User.countDocuments({ role: 'applicant' });
    const shortlistedApplicants = await Application.countDocuments({ status: 'Shortlisted' });
    const selectedApplicants = await Application.countDocuments({ status: 'Selected' });

    // 1. Application Status Distribution for Pie/Bar charts
    const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    const applicationsByStatus = await Promise.all(
      statuses.map(async (status) => {
        const count = await Application.countDocuments({ status });
        return { name: status, status, count, value: count };
      })
    );

    // 2. Applications per Job (top 6 jobs)
    const jobs = await Job.find({ status: 'Active' }).select('title company').limit(6);
    const applicationsPerJob = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return {
          name: job.title.length > 18 ? job.title.slice(0, 18) + '...' : job.title,
          jobTitle: job.title,
          company: job.company,
          applications: count,
          count,
        };
      })
    );

    // 3. Jobs by Employment Type
    const types = ['Full Time', 'Part Time', 'Remote', 'Internship', 'Contract'];
    const jobsByEmploymentType = await Promise.all(
      types.map(async (type) => {
        const count = await Job.countDocuments({ employmentType: type });
        return { name: type, type, count, value: count };
      })
    );

    // 4. Recent 5 Applications with candidate & job info
    const recentApplications = await Application.find()
      .populate('jobId', 'title company location')
      .populate('applicantId', 'name email phone profileImage')
      .sort({ appliedAt: -1 })
      .limit(5);

    // 5. Recent 5 Jobs
    const recentJobs = await Job.find()
      .select('title company location employmentType status vacancies deadline createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const cards = {
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      totalApplicants,
      shortlistedApplicants,
      selectedApplicants,
    };

    const charts = {
      applicationsByStatus,
      applicationsPerJob,
      jobsByEmploymentType,
    };

    res.status(200).json({
      success: true,
      data: {
        cards,
        charts,
        summary: cards,
        applicationsByStatus,
        recentApplications,
        recentJobs,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
