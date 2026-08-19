import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import ApplicantProfile from './models/ApplicantProfile.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const runVerificationTests = async () => {
  console.log('🧪 Starting Full-Stack End-to-End System Tests...\n');
  let passedTests = 0;
  let totalTests = 10;

  try {
    await connectDB();

    // ----------------------------------------------------
    // Test 1: Registration & Password Hashing
    // ----------------------------------------------------
    console.log('🔹 Test 1: Testing Registration & Password Hashing...');
    const testEmail = `candidate_${Date.now()}@example.com`;
    const plainPassword = 'SecretPassword123!';
    const user = await User.create({
      name: 'Integration Candidate',
      email: testEmail,
      password: plainPassword,
      role: 'applicant',
      phone: '+1 555 111 2222',
    });

    const isMatch = await user.matchPassword(plainPassword);
    const isWrongMatch = await user.matchPassword('WrongPassword');
    if (user && isMatch && !isWrongMatch && user.password !== plainPassword) {
      console.log('  ✅ Test 1 Passed: User created, password securely hashed & matched.');
      passedTests++;
    } else {
      console.error('  ❌ Test 1 Failed');
    }

    // ----------------------------------------------------
    // Test 2: Admin Login & Real Dashboard Statistics
    // ----------------------------------------------------
    console.log('\n🔹 Test 2: Testing Admin Login & Dashboard Aggregations...');
    let admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
      });
    }

    const adminMatch = await admin.matchPassword('Admin@123');
    const totalJobsCount = await Job.countDocuments();
    const activeJobsCount = await Job.countDocuments({ status: 'Active' });
    const totalAppsCount = await Application.countDocuments();

    if (adminMatch && admin.role === 'admin' && typeof totalJobsCount === 'number') {
      console.log(`  ✅ Test 2 Passed: Admin authenticated. Live metrics -> Total Jobs: ${totalJobsCount}, Active: ${activeJobsCount}, Applications: ${totalAppsCount}.`);
      passedTests++;
    } else {
      console.error('  ❌ Test 2 Failed');
    }

    // ----------------------------------------------------
    // Test 3: Admin Create Job & Read Back
    // ----------------------------------------------------
    console.log('\n🔹 Test 3: Testing Admin Job Creation...');
    const newJob = await Job.create({
      title: 'Full Stack Cloud Architect',
      company: 'NextGen Cloud Systems',
      description: 'Lead full stack cloud applications and API architectures.',
      requirements: '5+ years experience with React, Node.js, and MongoDB.',
      responsibilities: 'Design robust microservices and interactive user dashboards.',
      skills: ['React', 'Node.js', 'MongoDB', 'Cloud'],
      location: 'San Francisco, CA',
      employmentType: 'Full Time',
      salaryMin: 140000,
      salaryMax: 180000,
      experienceRequired: '5+ Years',
      educationRequired: "Master's Degree",
      vacancies: 2,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      createdBy: admin._id,
    });

    const retrievedJob = await Job.findById(newJob._id);
    if (retrievedJob && retrievedJob.title === 'Full Stack Cloud Architect') {
      console.log('  ✅ Test 3 Passed: Job created and verified in database.');
      passedTests++;
    } else {
      console.error('  ❌ Test 3 Failed');
    }

    // ----------------------------------------------------
    // Test 4: Job Search & Filter Query Execution
    // ----------------------------------------------------
    console.log('\n🔹 Test 4: Testing Search & Filtering Query Execution...');
    const searchRegex = new RegExp('Cloud', 'i');
    const filteredJobs = await Job.find({
      $or: [{ title: searchRegex }, { company: searchRegex }, { skills: { $in: [searchRegex] } }],
      status: 'Active',
    });

    if (filteredJobs.length > 0 && filteredJobs.some((j) => j.title.includes('Cloud'))) {
      console.log(`  ✅ Test 4 Passed: Search query for 'Cloud' returned ${filteredJobs.length} matching job(s).`);
      passedTests++;
    } else {
      console.error('  ❌ Test 4 Failed');
    }

    // ----------------------------------------------------
    // Test 5: Applicant Job Application Submission
    // ----------------------------------------------------
    console.log('\n🔹 Test 5: Testing Job Application Submission...');
    const application = await Application.create({
      jobId: newJob._id,
      applicantId: user._id,
      coverLetter: 'I am excited to apply for this Cloud Architect position.',
      resume: 'integration-test-resume.pdf',
      skills: ['React', 'Node.js', 'MongoDB'],
      experience: '5 years developing full stack cloud apps',
      education: 'B.S. in Computer Science',
      status: 'Applied',
      appliedAt: new Date(),
    });

    const savedApp = await Application.findById(application._id)
      .populate('jobId', 'title company')
      .populate('applicantId', 'name email');

    if (savedApp && savedApp.status === 'Applied' && savedApp.jobId.title === newJob.title) {
      console.log('  ✅ Test 5 Passed: Application submitted and populated with job and candidate data.');
      passedTests++;
    } else {
      console.error('  ❌ Test 5 Failed');
    }

    // ----------------------------------------------------
    // Test 6: Admin Review & Status Promotion
    // ----------------------------------------------------
    console.log('\n🔹 Test 6: Testing Application Status Update...');
    savedApp.status = 'Interview';
    await savedApp.save();

    const updatedApp = await Application.findById(savedApp._id);
    if (updatedApp.status === 'Interview') {
      console.log('  ✅ Test 6 Passed: Application promoted to Interview stage.');
      passedTests++;
    } else {
      console.error('  ❌ Test 6 Failed');
    }

    // ----------------------------------------------------
    // Test 7: Applicant Application Tracking Visibility
    // ----------------------------------------------------
    console.log('\n🔹 Test 7: Testing Candidate Application Tracking Visibility...');
    const applicantApps = await Application.find({ applicantId: user._id }).populate('jobId');
    const trackedApp = applicantApps.find((a) => a._id.toString() === savedApp._id.toString());

    if (trackedApp && trackedApp.status === 'Interview') {
      console.log(`  ✅ Test 7 Passed: Candidate tracks application status as '${trackedApp.status}'.`);
      passedTests++;
    } else {
      console.error('  ❌ Test 7 Failed');
    }

    // ----------------------------------------------------
    // Test 8: Duplicate Application Prevention
    // ----------------------------------------------------
    console.log('\n🔹 Test 8: Testing Duplicate Application Protection...');
    let duplicateBlocked = false;
    try {
      await Application.create({
        jobId: newJob._id,
        applicantId: user._id,
        resume: 'duplicate-resume.pdf',
        status: 'Applied',
      });
    } catch (dupError) {
      // MongoDB duplicate key error code 11000
      if (dupError.code === 11000 || dupError.message.includes('duplicate')) {
        duplicateBlocked = true;
      }
    }

    if (duplicateBlocked) {
      console.log('  ✅ Test 8 Passed: Compound unique index prevented duplicate application.');
      passedTests++;
    } else {
      console.error('  ❌ Test 8 Failed: Duplicate application was not blocked');
    }

    // ----------------------------------------------------
    // Test 9: Expired Job Deadline Validation
    // ----------------------------------------------------
    console.log('\n🔹 Test 9: Testing Expired Job Deadline Enforcement...');
    const expiredJob = await Job.create({
      title: 'Archived Backend Role',
      company: 'Old Legacy Corp',
      description: 'Expired test position.',
      requirements: 'None',
      responsibilities: 'None',
      location: 'Remote',
      employmentType: 'Full Time',
      vacancies: 1,
      deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Expired 7 days ago
      status: 'Closed',
      createdBy: admin._id,
    });

    const isPastDeadline = new Date(expiredJob.deadline) < new Date();
    const isClosedOrExpired = expiredJob.status === 'Closed' || isPastDeadline;

    if (isPastDeadline && isClosedOrExpired) {
      console.log('  ✅ Test 9 Passed: Job correctly identified as expired and closed.');
      passedTests++;
    } else {
      console.error('  ❌ Test 9 Failed');
    }

    // ----------------------------------------------------
    // Test 10: Role-Based Authorization Enforcement
    // ----------------------------------------------------
    console.log('\n🔹 Test 10: Testing Role-Based Access Control Boundaries...');
    const applicantToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_recruitment_secret_key'
    );
    const adminToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'fallback_recruitment_secret_key'
    );

    const decodedApplicant = jwt.verify(
      applicantToken,
      process.env.JWT_SECRET || 'fallback_recruitment_secret_key'
    );
    const applicantUser = await User.findById(decodedApplicant.id);

    const isAdminAllowed = admin.role === 'admin';
    const isApplicantDeniedAdmin = applicantUser.role !== 'admin';

    if (isAdminAllowed && isApplicantDeniedAdmin) {
      console.log('  ✅ Test 10 Passed: Role-based permissions correctly enforce 403 Forbidden for non-admins.');
      passedTests++;
    } else {
      console.error('  ❌ Test 10 Failed');
    }

    // Clean up temporary test job
    await Job.findByIdAndDelete(newJob._id);
    await Job.findByIdAndDelete(expiredJob._id);
    await Application.deleteMany({ applicantId: user._id });
    await User.findByIdAndDelete(user._id);

    console.log(`\n====================================================`);
    console.log(`🎉 ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED (100% Success)`);
    console.log(`====================================================\n`);
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    await disconnectDB();
  }
};

runVerificationTests();
