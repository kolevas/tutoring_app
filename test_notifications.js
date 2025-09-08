// Simple test script to check notifications API
const axios = require('axios');

async function testNotifications() {
  try {
    console.log('Testing notifications API...');
    
    // Test health endpoint first
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('Health check:', health.data);
    
    // Try to get notifications (this will fail without auth, but we can see the error)
    try {
      const notifications = await axios.get('http://localhost:5000/api/notifications');
      console.log('Notifications:', notifications.data);
    } catch (authError) {
      console.log('Expected auth error (need to login first):', authError.response?.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNotifications();
