import mongoose from 'mongoose';
import './Job.js';
import './User.js';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
    },
    resume: {
      type: String,
      required: [true, 'Resume is required'],
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same job by the same user
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
