const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all availability slots for a tutor
// @route   GET /api/availability/:tutorId?
// @access  Public
router.get('/:tutorId?', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const query = tutorId ? { tutor: tutorId } : {};
    
    const availability = await Availability.find(query)
      .populate('tutor', 'name email avatar subjects hourlyRate rating')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get availability for current tutor
// @route   GET /api/availability/my/slots
// @access  Private (Tutor only)
router.get('/my/slots', protect, authorize('tutor'), async (req, res) => {
  try {
    const availability = await Availability.find({ tutor: req.user._id })
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create availability slot
// @route   POST /api/availability
// @access  Private (Tutor only)
router.post('/', protect, authorize('tutor'), async (req, res) => {
  try {
    const {
      dayOfWeek,
      startTime,
      endTime,
      isRecurring,
      specificDate,
      timezone
    } = req.body;

    // Validate required fields
    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Day of week, start time, and end time are required'
      });
    }

    // Check if slot already exists
    const existingSlot = await Availability.findOne({
      tutor: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
      specificDate
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'This availability slot already exists'
      });
    }

    const availability = new Availability({
      tutor: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      specificDate: specificDate || null,
      timezone: timezone || 'UTC'
    });

    await availability.save();
    await availability.populate('tutor', 'name email avatar subjects hourlyRate rating');

    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Create availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update availability slot
// @route   PUT /api/availability/:id
// @access  Private (Tutor only)
router.put('/:id', protect, authorize('tutor'), async (req, res) => {
  try {
    let availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    // Make sure tutor owns the availability slot
    if (availability.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this availability slot'
      });
    }

    availability = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tutor', 'name email avatar subjects hourlyRate rating');

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete availability slot
// @route   DELETE /api/availability/:id
// @access  Private (Tutor only)
router.delete('/:id', protect, authorize('tutor'), async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    // Make sure tutor owns the availability slot
    if (availability.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this availability slot'
      });
    }

    await Availability.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Availability slot deleted'
    });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get available time slots for a specific date and tutor
// @route   GET /api/availability/:tutorId/date/:date
// @access  Public
router.get('/:tutorId/date/:date', async (req, res) => {
  try {
    const { tutorId, date } = req.params;
    const targetDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()];

    // Get tutor's general availability for this day
    const availability = await Availability.find({
      tutor: tutorId,
      $or: [
        { dayOfWeek, isRecurring: true },
        { specificDate: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) } }
      ],
      isAvailable: true
    }).populate('tutor', 'name email avatar subjects hourlyRate rating');

    // TODO: Filter out time slots that are already booked
    // This would require checking against the Session model

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Get date availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
