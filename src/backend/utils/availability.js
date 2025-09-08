const Session = require('../models/Session');

/**
 * Given a list of availability slots and a date, returns only the slots that are not already taken by a session.
 * @param {Array} slots - Array of availability slot objects (with startTime, endTime, etc)
 * @param {String|Date} date - The date to check sessions for
 * @param {String} tutorId - The tutor's ObjectId
 * @returns {Promise<Array>} - Array of available slots
 */
async function filterAvailableSlots(slots, date, tutorId) {
  const sessions = await Session.find({
    tutor: tutorId,
    date: new Date(date),
    status: { $in: ['available', 'booked'] }
  });

  return slots.filter(slot => {
    // Check if any session overlaps with this slot
    return !sessions.some(session =>
      session.startTime === slot.startTime &&
      session.endTime === slot.endTime
    );
  });
}

module.exports = { filterAvailableSlots };
