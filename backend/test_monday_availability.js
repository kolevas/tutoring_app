require('dotenv').config();
const mongoose = require('mongoose');
const Availability = require('./models/Availability');
const User = require('./models/User');

async function checkMondayAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring_app');
    
    const testDate = '2025-07-21';
    console.log('Checking availability for Monday', testDate);
    
    // Get all availability
    const availability = await Availability.find().populate('tutor', 'name email');
    
    console.log('\n=== MONDAY AVAILABILITY ===');
    const mondaySlots = availability.filter(slot => {
      if (slot.isRecurring && slot.dayOfWeek === 'monday') {
        return true;
      }
      if (!slot.isRecurring && slot.specificDate) {
        const slotDate = new Date(slot.specificDate).toISOString().split('T')[0];
        return slotDate === testDate;
      }
      return false;
    });
    
    mondaySlots.forEach(slot => {
      console.log(`${slot.tutor.name}: ${slot.startTime} - ${slot.endTime}`);
      if (slot.isRecurring) {
        console.log('  Type: Recurring Monday');
      } else {
        console.log('  Type: Specific date', new Date(slot.specificDate).toDateString());
      }
    });
    
    console.log('\nTotal Monday slots:', mondaySlots.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkMondayAvailability();
