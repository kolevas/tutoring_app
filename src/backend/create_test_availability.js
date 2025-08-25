require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Define availability schema
const availabilitySchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  specificDate: {
    type: Date
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Availability = mongoose.model('Availability', availabilitySchema);

async function createTestAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring_app');
    console.log('Connected to MongoDB');

    // Get some tutors
    const tutors = await User.find({ role: 'tutor' }).limit(3);

    if (tutors.length === 0) {
      console.log('No tutors found. Please run the seed script first.');
      return;
    }

    // Clear existing availability first
    await Availability.deleteMany({});
    console.log('Cleared existing availability');

    const testAvailability = [];

    // Add recurring availability for each tutor
    tutors.forEach((tutor, index) => {
      // Each tutor has availability on different days
      const tutorDays = [
        ['monday', 'wednesday', 'friday'],
        ['tuesday', 'thursday'],
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      ];

      const days = tutorDays[index] || ['monday', 'wednesday', 'friday'];

      days.forEach(dayOfWeek => {
        testAvailability.push({
          tutor: tutor._id,
          dayOfWeek: dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          isAvailable: true
        });

        // Add another time slot for some days
        if (dayOfWeek === 'monday' || dayOfWeek === 'wednesday') {
          testAvailability.push({
            tutor: tutor._id,
            dayOfWeek: dayOfWeek,
            startTime: '18:00',
            endTime: '20:00',
            isRecurring: true,
            isAvailable: true
          });
        }
      });

      // Add specific date availability (next Monday)
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
      
      testAvailability.push({
        tutor: tutor._id,
        specificDate: nextMonday,
        startTime: '10:00',
        endTime: '12:00',
        isRecurring: false,
        isAvailable: true
      });
    });

    const createdAvailability = await Availability.insertMany(testAvailability);
    console.log(`Created ${createdAvailability.length} availability slots:`);
    
    // Group by tutor for display
    const availabilityByTutor = {};
    for (const slot of createdAvailability) {
      const tutorName = tutors.find(t => t._id.toString() === slot.tutor.toString())?.name || 'Unknown';
      if (!availabilityByTutor[tutorName]) {
        availabilityByTutor[tutorName] = [];
      }
      
      if (slot.isRecurring) {
        availabilityByTutor[tutorName].push(`${slot.dayOfWeek}: ${slot.startTime} - ${slot.endTime} (recurring)`);
      } else {
        availabilityByTutor[tutorName].push(`${slot.specificDate.toDateString()}: ${slot.startTime} - ${slot.endTime} (specific date)`);
      }
    }

    Object.entries(availabilityByTutor).forEach(([tutorName, slots]) => {
      console.log(`\n${tutorName}:`);
      slots.forEach(slot => console.log(`  - ${slot}`));
    });

    console.log('\nTest availability created successfully!');
    
  } catch (error) {
    console.error('Error creating test availability:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestAvailability();
