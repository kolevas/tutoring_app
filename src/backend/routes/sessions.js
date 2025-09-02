const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const Availability = require('../models/Availability');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Utility function to mark expired sessions
const markExpiredSessions = async () => {
  try {
    const now = new Date();
    
    // Find sessions that have passed their date and are still available or booked
    const expiredSessions = await Session.find({
      date: { $lt: now },
      status: { $in: ['available', 'booked'] }
    });

    // Update them to expired status
    if (expiredSessions.length > 0) {
      await Session.updateMany(
        {
          date: { $lt: now },
          status: { $in: ['available', 'booked'] }
        },
        { status: 'expired' }
      );
      
      console.log(`Marked ${expiredSessions.length} sessions as expired`);
    }
  } catch (error) {
    console.error('Error marking expired sessions:', error);
  }
};

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    // First, mark any expired sessions
    await markExpiredSessions();
    
    const { status, tutor, student, date } = req.query;
    let query = {};

    if (status) query.status = status;
    if (tutor) query.tutor = tutor;
    if (student) query.student = student;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const sessions = await Session.find(query)
      .populate('tutor', 'name email subjects')
      .populate('student', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('tutor', 'name email subjects bio')
      .populate('student', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Tutor/Admin)
const createSession = async (req, res) => {
  try {
    // Add user to req.body
    req.body.tutor = req.user.id;

    const { date, startTime, endTime } = req.body;

    // Get day of week for the session date
    const sessionDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][sessionDate.getDay()];

    // Check if tutor has availability for this day and time
    const availability = await Availability.findOne({
      tutor: req.user.id,
      isAvailable: true,
      $or: [
        // Check recurring availability
        { 
          isRecurring: true,
          dayOfWeek,
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        },
        // Check specific date availability
        {
          isRecurring: false,
          specificDate: {
            $gte: new Date(date),
            $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
          },
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'You do not have availability set for this day and time. Please set your availability first.'
      });
    }

    // Check for conflicting sessions
    const conflictingSession = await Session.findOne({
      tutor: req.user.id,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['available', 'booked'] },
      $or: [
        // New session starts during existing session
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New session ends during existing session
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New session completely contains existing session
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });

    if (conflictingSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have a session scheduled during this time.'
      });
    }

    const session = await Session.create(req.body);

    // Populate the created session
    await session.populate('tutor', 'name email subjects');

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Make sure user is session tutor or admin
    if (session.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Tutor/Admin)
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Make sure user is session tutor or admin
    if (session.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this session'
      });
    }

    await session.deleteOne();

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

// @desc    Book a session (for students)
// @route   PUT /api/sessions/:id/book
// @access  Private (Student)
const bookSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Session is not available for booking'
      });
    }

    session.student = req.user.id;
    session.status = 'booked';
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('tutor', 'name email subjects')
      .populate('student', 'name email');

    res.json({
      success: true,
      data: populatedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/sessions/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the student who booked or tutor or admin
    if (session.student.toString() !== req.user.id && 
        session.tutor.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    session.student = null;
    session.status = 'available';
    await session.save();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tutor availability
// @route   GET /api/sessions/availability/:tutorId
// @access  Private
const getTutorAvailability = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { startDate, endDate } = req.query;

    let query = {
      tutor: tutorId,
      status: 'available'
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const availability = await Session.find(query)
      .populate('tutor', 'name email subjects')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create multiple availability slots
// @route   POST /api/sessions/availability/bulk
// @access  Private (Tutor only)
const createBulkAvailability = async (req, res) => {
  try {
    const { slots } = req.body;
    const tutorId = req.user._id;

    // Validate all slots belong to the current tutor
    const validatedSlots = slots.map(slot => ({
      ...slot,
      tutor: tutorId,
      status: 'available'
    }));

    const createdSlots = await Session.insertMany(validatedSlots);

    res.status(201).json({
      success: true,
      count: createdSlots.length,
      data: createdSlots
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update availability slot
// @route   PUT /api/sessions/availability/:id
// @access  Private (Tutor only)
const updateAvailability = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns this session or is admin
    if (session.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    // Don't allow updating if session is booked
    if (session.status === 'booked' && req.body.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify booked session'
      });
    }

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tutor', 'name email subjects')
     .populate('student', 'name email');

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get available sessions for booking
// @route   GET /api/sessions/available
// @access  Public
const getAvailableSessions = async (req, res) => {
  try {
    // First, mark any expired sessions
    await markExpiredSessions();
    
    const { subject, date, tutor } = req.query;
    let query = { status: 'available' };

    if (subject) query.subject = new RegExp(subject, 'i');
    if (tutor) query.tutor = tutor;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Only show future sessions
    const now = new Date();
    if (!query.date) {
      query.date = { $gte: now };
    }

    const sessions = await Session.find(query)
      .populate('tutor', 'name email subjects bio avatar rating reviewCount hourlyRate')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

router.route('/')
  .get(protect, getSessions)
  .post(protect, authorize('tutor', 'admin'), createSession);

// Route for browsing available sessions (public access for students)
router.get('/available', getAvailableSessions);

router.route('/:id')
  .get(protect, getSession)
  .put(protect, updateSession)
  .delete(protect, authorize('tutor', 'admin'), deleteSession);

// Availability routes
router.get('/availability/:tutorId', protect, getTutorAvailability);
router.post('/availability/bulk', protect, authorize('tutor', 'admin'), createBulkAvailability);
router.put('/availability/:id', protect, authorize('tutor', 'admin'), updateAvailability);

// Booking routes
router.put('/:id/book', protect, authorize('student'), bookSession);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
