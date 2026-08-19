import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: String,
      required: [true, 'Job requirements are required'],
    },
    responsibilities: {
      type: String,
      required: [true, 'Job responsibilities are required'],
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'],
      default: 'Full Time',
    },
    salaryMin: {
      type: Number,
      default: 0,
      min: [0, 'Minimum salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      default: 0,
      min: [0, 'Maximum salary cannot be negative'],
    },
    experienceRequired: {
      type: String,
      required: [true, 'Experience requirement is required'],
      default: '0-1 Years',
    },
    educationRequired: {
      type: String,
      required: [true, 'Education requirement is required'],
      default: "Bachelor's Degree",
    },
    vacancies: {
      type: Number,
      required: [true, 'Number of vacancies is required'],
      min: [1, 'Must have at least 1 vacancy'],
      default: 1,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searching & filtering
jobSchema.index({ title: 'text', company: 'text', location: 'text', description: 'text' });
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ employmentType: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
