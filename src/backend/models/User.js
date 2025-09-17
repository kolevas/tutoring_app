const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        // Basic email validation - specific format requirements can be handled in frontend
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  studentIndex: {
    type: String,
    required: function() {
      // Required for students and tutors, but not for admins
      return this.role !== 'admin';
    },
    unique: true,
    sparse: true, // Allows null values to not be unique
    validate: {
      validator: function(index) {
        // Only validate format if provided
        if (index) {
          return /^\d{6}$/.test(index);
        }
        return true;
      },
      message: 'Student index must be 6 digits'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  subjects: [{
    type: String
  }], // For tutors - subjects they can teach
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  availability: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTimes: {
      start: String,
      end: String
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Validate studentIndex requirement based on role
userSchema.pre('save', function(next) {
  // If role is student or tutor, studentIndex is required
  if ((this.role === 'student' || this.role === 'tutor') && !this.studentIndex) {
    const error = new Error('Student index is required for students and tutors');
    return next(error);
  }
  
  // If role is admin, studentIndex should not be set
  if (this.role === 'admin' && this.studentIndex) {
    this.studentIndex = undefined; // Remove studentIndex for admin users
  }
  
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
