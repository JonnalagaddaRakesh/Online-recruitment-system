import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import ApplicantProfile from './models/ApplicantProfile.js';

dotenv.config();

const viewDatabase = async () => {
  try {
    await connectDB();

    console.log('\n========================================================================================================');
    console.log('                          📊 MONGODB ATLAS - DATABASE VIEWER & TIMESTAMPS                               ');
    console.log('========================================================================================================\n');

    // 1. Users Collection with Login Timestamps
    const users = await User.find().select('-password');
    console.log(`👤 1. USERS COLLECTION (${users.length} records):`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString().slice(-6),
        Name: u.name,
        Email: u.email,
        Role: u.role,
        RegisteredAt: new Date(u.createdAt).toLocaleString(),
        LastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'N/A',
        TotalLogins: u.loginHistory?.length || 1,
      }))
    );

    // 2. Jobs Collection
    const jobs = await Job.find();
    console.log(`\n💼 2. JOBS COLLECTION (${jobs.length} records):`);
    console.table(
      jobs.map((j) => ({
        ID: j._id.toString().slice(-6),
        Title: j.title.length > 25 ? j.title.slice(0, 25) + '...' : j.title,
        Company: j.company,
        Location: j.location,
        Type: j.employmentType,
        Salary: `$${j.salaryMin?.toLocaleString()} - $${j.salaryMax?.toLocaleString()}`,
        Status: j.status,
        PostedAt: new Date(j.createdAt).toLocaleDateString(),
        Deadline: new Date(j.deadline).toLocaleDateString(),
      }))
    );

    // 3. Applications Collection with Applied Timestamps
    const applications = await Application.find()
      .populate('jobId', 'title company')
      .populate('applicantId', 'name email');
    console.log(`\n📄 3. APPLICATIONS COLLECTION (${applications.length} records):`);
    console.table(
      applications.map((a) => ({
        ID: a._id.toString().slice(-6),
        Applicant: a.applicantId?.name || 'Unknown',
        Job: a.jobId?.title || 'Unknown',
        Company: a.jobId?.company || 'Unknown',
        Status: a.status,
        AppliedAt: new Date(a.appliedAt).toLocaleString(),
      }))
    );

    // 4. Applicant Profiles Collection
    const profiles = await ApplicantProfile.find();
    console.log(`\n📋 4. APPLICANT PROFILES COLLECTION (${profiles.length} records):`);
    console.table(
      profiles.map((p) => ({
        FullName: p.fullName,
        Email: p.email,
        City: p.city || 'N/A',
        Skills: p.skills?.slice(0, 3).join(', ') || 'N/A',
        Education: p.education?.slice(0, 25) || 'N/A',
        Resume: p.resume || 'N/A',
        UpdatedAt: new Date(p.updatedAt).toLocaleString(),
      }))
    );

    console.log('\n========================================================================================================\n');
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await disconnectDB();
  }
};

viewDatabase();
