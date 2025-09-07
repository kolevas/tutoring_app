const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: function() {
      return this.isRecurring !== false;
    }
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  specificDate: {
    type: Date,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
availabilitySchema.index({ tutor: 1, dayOfWeek: 1 });
availabilitySchema.index({ tutor: 1, specificDate: 1 });

// Virtual for checking if this slot is in the future
availabilitySchema.virtual('isFuture').get(function() {
  if (this.specificDate) {
    return this.specificDate > new Date();
  }
  return true; // Recurring availability is always "future"
});

module.exports = mongoose.model('Availability', availabilitySchema);
