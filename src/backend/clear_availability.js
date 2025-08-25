require('dotenv').config();
const mongoose = require('mongoose');

// Connect and clear availability data
async function clearAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring_app');
    console.log('Connected to MongoDB');

    // Clear all availability records
    const Availability = mongoose.model('Availability', new mongoose.Schema({}, { strict: false }));
    const result = await Availability.deleteMany({});
    
    console.log(`Cleared ${result.deletedCount} availability records`);
    console.log('Availability data cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing availability:', error);
  } finally {
    await mongoose.connection.close();
  }
}

clearAvailability();
