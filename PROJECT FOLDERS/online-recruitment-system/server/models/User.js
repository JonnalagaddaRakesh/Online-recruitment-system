import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const loginRecordSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Browser Session',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'applicant'],
        message: '{VALUE} is not a valid role',
      },
      default: 'applicant',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginHistory: {
      type: [loginRecordSchema],
      default: () => [
        {
          timestamp: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Registration Session',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
