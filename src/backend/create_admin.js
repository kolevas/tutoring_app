const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Create initial admin user
const createInitialAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'admin123', // Change this to a secure password
      role: 'admin'
    });

    console.log('Initial admin user created successfully:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: admin123`);
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createInitialAdmin();
