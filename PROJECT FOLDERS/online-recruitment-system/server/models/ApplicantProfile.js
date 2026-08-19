import mongoose from 'mongoose';
import './User.js';

const applicantProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: String,
      trim: true,
      default: '',
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
    resume: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ApplicantProfile = mongoose.model('ApplicantProfile', applicantProfileSchema);
export default ApplicantProfile;
