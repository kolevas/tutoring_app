const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

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
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    // For recurring availability, dayOfWeek is required
    if (isRecurring !== false && !dayOfWeek) {
      return res.status(400).json({
        success: false,
        message: 'Day of week is required for recurring availability'
      });
    }

    // For non-recurring availability, specificDate is required
    if (isRecurring === false && !specificDate) {
      return res.status(400).json({
        success: false,
        message: 'Specific date is required for non-recurring availability'
      });
    }

    // Prepare the availability data
    const availabilityData = {
      tutor: req.user._id,
      startTime,
      endTime,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      specificDate: specificDate || null,
      timezone: timezone || 'UTC'
    };

    // Only include dayOfWeek for recurring availability
    if (isRecurring !== false && dayOfWeek) {
      availabilityData.dayOfWeek = dayOfWeek;
    }

    // Check if slot already exists
    const existingSlotQuery = {
      tutor: req.user._id,
      startTime,
      endTime
    };

    if (isRecurring !== false) {
      // For recurring slots, check dayOfWeek
      existingSlotQuery.dayOfWeek = dayOfWeek;
      existingSlotQuery.isRecurring = { $ne: false };
    } else {
      // For non-recurring slots, check specificDate
      existingSlotQuery.specificDate = specificDate;
      existingSlotQuery.isRecurring = false;
    }

    const existingSlot = await Availability.findOne(existingSlotQuery);

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'This availability slot already exists'
      });
    }

    const availability = new Availability(availabilityData);

    await availability.save();
    await availability.populate('tutor', 'name email avatar subjects hourlyRate rating');

    // Create notification for availability creation
    try {
      const dateInfo = isRecurring !== false 
        ? `every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`
        : `on ${new Date(specificDate).toLocaleDateString()}`;
      
      await NotificationService.createAvailabilityNotification(
        req.user._id,
        req.user,
        availability,
        'created',
        `New availability slot created for ${dateInfo} from ${startTime} to ${endTime}`
      );
    } catch (notificationError) {
      console.error('Failed to create availability notification:', notificationError);
      // Don't fail the request if notification fails
    }

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

    // Create notification for availability update
    try {
      const dateInfo = availability.isRecurring !== false 
        ? `every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][availability.dayOfWeek]}`
        : `on ${new Date(availability.specificDate).toLocaleDateString()}`;
      
      await NotificationService.createAvailabilityNotification(
        req.user._id,
        req.user,
        availability,
        'updated',
        `Availability slot updated for ${dateInfo} from ${availability.startTime} to ${availability.endTime}`
      );
    } catch (notificationError) {
      console.error('Failed to create availability update notification:', notificationError);
      // Don't fail the request if notification fails
    }

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

    // Create notification for availability deletion
    try {
      const dateInfo = availability.isRecurring !== false 
        ? `every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][availability.dayOfWeek]}`
        : `on ${new Date(availability.specificDate).toLocaleDateString()}`;
      
      await NotificationService.createAvailabilityNotification(
        req.user._id,
        req.user,
        availability,
        'deleted',
        `Availability slot deleted for ${dateInfo} from ${availability.startTime} to ${availability.endTime}`
      );
    } catch (notificationError) {
      console.error('Failed to create availability deletion notification:', notificationError);
      // Don't fail the request if notification fails
    }

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

    // Filter out slots that already have a session for this date/time/tutor
    const { filterAvailableSlots } = require('../utils/availability');
    const availableSlots = await filterAvailableSlots(availability, date, tutorId);

    res.json({
      success: true,
      data: availableSlots
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
