const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, studentIndex, password } = req.body;

    // Check if user exists (by email or student index)
    const existingUser = await User.findOne({
      $or: [
        { email },
        { studentIndex }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (existingUser.studentIndex === studentIndex) {
        return res.status(400).json({
          success: false,
          message: 'Student index already exists'
        });
      }
    }

    // Create user with default 'student' role
    // Only admins can assign other roles later
    const user = await User.create({
      name,
      email,
      studentIndex,
      password,
      role: 'student' // Always start as student
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          studentIndex: user.studentIndex,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Changed from email to identifier

    let user;
    
    // Check if identifier is an email (for admin) or student index (for students/tutors)
    if (identifier.includes('@')) {
      // Login with email (admin)
      user = await User.findOne({ email: identifier }).select('+password');
    } else {
      // Login with student index (students/tutors)
      user = await User.findOne({ studentIndex: identifier }).select('+password');
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          studentIndex: user.studentIndex,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
