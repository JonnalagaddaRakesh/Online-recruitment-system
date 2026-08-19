import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import ApplicantProfile from './models/ApplicantProfile.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import { initialUsers, initialProfiles, initialJobs } from './utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await ApplicantProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    // Ensure sample resume files exist in uploads/resumes
    const resumeDir = path.join(__dirname, 'uploads/resumes');
    if (!fs.existsSync(resumeDir)) {
      fs.mkdirSync(resumeDir, { recursive: true });
    }

    const sampleResumes = ['sample-resume-sarah.pdf', 'sample-resume-alex.pdf', 'sample-resume-priya.pdf'];
    sampleResumes.forEach((filename) => {
      const filePath = path.join(resumeDir, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n180\n%%EOF`
        );
      }
    });

    console.log('👤 Seeding Users...');
    // Create users individually so pre('save') hash triggers properly
    const createdUsers = [];
    for (const userData of initialUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const applicantUsers = createdUsers.filter((u) => u.role === 'applicant');

    console.log('📋 Seeding Applicant Profiles...');
    for (const prof of initialProfiles) {
      const matchedUser = createdUsers.find((u) => u.email === prof.email);
      if (matchedUser) {
        await ApplicantProfile.create({
          userId: matchedUser._id,
          fullName: prof.fullName,
          email: prof.email,
          phone: prof.phone,
          dateOfBirth: prof.dateOfBirth,
          gender: prof.gender,
          address: prof.address,
          city: prof.city,
          state: prof.state,
          education: prof.education,
          skills: prof.skills,
          experience: prof.experience,
          resume: prof.resume,
        });
      }
    }

    console.log('💼 Seeding Job Postings...');
    const createdJobs = [];
    for (const jobData of initialJobs) {
      const job = await Job.create({
        ...jobData,
        createdBy: adminUser._id,
      });
      createdJobs.push(job);
    }

    console.log('📄 Seeding Realistic Applications...');
    // Sarah applies to Senior React Developer (Shortlisted) and Full Stack Node (Interview)
    const sarah = applicantUsers.find((u) => u.email === 'sarah.connor@example.com');
    const alex = applicantUsers.find((u) => u.email === 'alex.rivera@example.com');
    const priya = applicantUsers.find((u) => u.email === 'priya.sharma@example.com');

    const sampleApplications = [
      {
        jobId: createdJobs[0]._id, // Senior React Dev
        applicantId: sarah._id,
        coverLetter: 'I have over 5 years of extensive React experience and have led frontend teams building mission-critical cloud applications.',
        resume: 'sample-resume-sarah.pdf',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
        experience: '5+ years building frontend SaaS applications',
        education: 'B.S. Computer Science, Stanford University',
        status: 'Shortlisted',
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        jobId: createdJobs[1]._id, // Full Stack Node
        applicantId: sarah._id,
        coverLetter: 'Passionate about full-stack architectures. I have built multiple full stack portals using React, Node.js, and MongoDB.',
        resume: 'sample-resume-sarah.pdf',
        skills: ['React', 'Node.js', 'Express', 'MongoDB'],
        experience: '3 years full stack web engineering',
        education: 'B.S. Computer Science, Stanford University',
        status: 'Interview',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        jobId: createdJobs[1]._id, // Full Stack Node
        applicantId: alex._id,
        coverLetter: 'Specialized in microservices, distributed systems, and Express APIs with high throughput and low latency.',
        resume: 'sample-resume-alex.pdf',
        skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
        experience: '6 years backend and cloud engineering',
        education: 'M.S. Software Engineering, UT Austin',
        status: 'Selected',
        appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        jobId: createdJobs[3]._id, // Backend Systems Engineer
        applicantId: alex._id,
        coverLetter: 'Experienced backend systems architect. Built low-latency MongoDB aggregation pipelines handling millions of records.',
        resume: 'sample-resume-alex.pdf',
        skills: ['Node.js', 'MongoDB', 'Redis', 'Docker'],
        experience: '6 years database systems and REST APIs',
        education: 'M.S. Software Engineering, UT Austin',
        status: 'Under Review',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        jobId: createdJobs[2]._id, // UI/UX Designer
        applicantId: priya._id,
        coverLetter: 'Excited about bridging beautiful Figma designs with clean React and Tailwind code. I love designing accessible UI.',
        resume: 'sample-resume-priya.pdf',
        skills: ['Figma', 'UI/UX Design', 'React', 'Tailwind CSS'],
        experience: '3.5 years frontend design and design systems',
        education: 'B.Tech IT, IIT Bombay',
        status: 'Applied',
        appliedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ];

    for (const appData of sampleApplications) {
      await Application.create(appData);
    }

    console.log('✅ Database Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Credentials:');
    console.log('  👑 Admin:     admin@example.com     / Admin@123');
    console.log('  👤 Applicant: sarah.connor@example.com / Password@123');
    console.log('  👤 Applicant: alex.rivera@example.com  / Password@123');
    console.log('  👤 Applicant: priya.sharma@example.com / Password@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Auto-run if executed directly via node seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    disconnectDB().then(() => process.exit(0));
  });
}
