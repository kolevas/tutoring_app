const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @desc    Create new user (admin only)
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, subjects } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate role
    if (!['student', 'tutor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Create user data
    const userData = {
      name,
      email,
      password,
      role
    };

    // Add subjects if user is a tutor
    if (role === 'tutor' && subjects) {
      userData.subjects = subjects;
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subjects: user.subjects || []
        },
        message: 'User created successfully'
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

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    if (role) query.role = role;

    const users = await User.find(query).select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Users can only update their own profile (unless admin)
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio,
      subjects: req.body.subjects
    };

    // Only admin can change roles
    if (req.user.role === 'admin' && req.body.role) {
      fieldsToUpdate.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!['student', 'tutor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-demotion from admin (security measure)
    if (req.user.id === req.params.id && req.user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot demote themselves'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: `User role updated to ${role}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk update user roles
// @route   PUT /api/users/roles/bulk
// @access  Private (Admin only)
const bulkUpdateUserRoles = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { userId, role }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { userId, role } = update;
        
        if (!['student', 'tutor', 'admin'].includes(role)) {
          errors.push({ userId, error: 'Invalid role' });
          continue;
        }

        const user = await User.findById(userId);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        // Prevent self-demotion from admin
        if (req.user.id === userId && req.user.role === 'admin' && role !== 'admin') {
          errors.push({ userId, error: 'Cannot demote self from admin' });
          continue;
        }

        user.role = role;
        await user.save();
        
        results.push({
          userId,
          name: user.name,
          email: user.email,
          newRole: role
        });
      } catch (error) {
        errors.push({ userId: update.userId, error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        updated: results,
        errors: errors
      },
      message: `${results.length} users updated successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tutors
// @route   GET /api/users/tutors
// @access  Public
const getTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor', isActive: true })
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: tutors.length,
      data: tutors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

router.get('/tutors', getTutors);

// Role management routes (Admin only)
router.put('/roles/bulk', protect, authorize('admin'), bulkUpdateUserRoles);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
