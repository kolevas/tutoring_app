require('dotenv').config();
const mongoose = require('mongoose');
const Availability = require('./models/Availability');
const User = require('./models/User');

async function checkSpecificDateAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring_app');
    
    console.log('=== SPECIFIC DATE AVAILABILITY ===');
    const specificAvailability = await Availability.find({ isRecurring: false }).populate('tutor', 'name');
    
    specificAvailability.forEach(slot => {
      console.log('Tutor:', slot.tutor.name);
      console.log('Date:', slot.specificDate);
      console.log('Time:', slot.startTime, '-', slot.endTime);
      console.log('Day of Week field:', slot.dayOfWeek);
      console.log('Is Available:', slot.isAvailable);
      console.log('---');
    });
    
    console.log('\n=== TEST BACKEND QUERY ===');
    // Test the exact query the backend is using
    const testDate = '2025-07-21';
    const startTime = '10:00';
    const endTime = '11:30';
    const sessionDate = new Date(testDate);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][sessionDate.getDay()];
    
    console.log('Testing for:', testDate, startTime, '-', endTime, '(', dayOfWeek, ')');
    
    const availability = await Availability.findOne({
      tutor: specificAvailability[0].tutor._id, // Use first tutor for test
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
            $gte: new Date(testDate),
            $lt: new Date(new Date(testDate).getTime() + 24 * 60 * 60 * 1000)
          },
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });
    
    console.log('Backend query result:', availability);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkSpecificDateAvailability();
