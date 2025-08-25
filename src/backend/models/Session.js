const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a session title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide an end time']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'completed', 'cancelled'],
    default: 'available'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ tutor: 1, date: 1 });
sessionSchema.index({ student: 1, date: 1 });
sessionSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Session', sessionSchema);
