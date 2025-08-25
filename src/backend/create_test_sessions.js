require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('./models/Session');
const User = require('./models/User');

async function createTestSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring_app');
    console.log('Connected to MongoDB');

    // Get some users
    const tutors = await User.find({ role: 'tutor' }).limit(3);
    const students = await User.find({ role: 'student' }).limit(2);

    if (tutors.length === 0 || students.length === 0) {
      console.log('No tutors or students found. Please run the seed script first.');
      return;
    }

    // Clear existing sessions first
    await Session.deleteMany({});
    console.log('Cleared existing sessions');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(now);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const testSessions = [
      // Upcoming sessions
      {
        title: 'Основи на објектно ориентирано програмирање',
        subject: 'Програмирање во C++',
        level: 'Beginner',
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        tutor: tutors[0]._id,
        student: students[0]._id,
        status: 'booked',
        description: 'Класи, објекти, наследување и полиморфизам',
        meetingLink: 'https://meet.google.com/abc-def-ghi'
      },
      {
        title: 'Напредни концепти во JavaScript и Vue.js',
        subject: 'Веб програмирање',
        level: 'Intermediate', 
        date: nextWeek,
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        tutor: tutors[1]._id,
        student: students[1]._id,
        status: 'booked',
        description: 'Компоненти, рутирање и состојба во Vue.js',
        meetingLink: 'https://meet.google.com/xyz-uvw-rst'
      },
      {
        title: 'Оптимизација на SQL упити и индекси',
        subject: 'Бази на податоци',
        level: 'Advanced',
        date: nextWeek,
        startTime: '16:00',
        endTime: '17:00',
        duration: 60,
        tutor: tutors[2]._id,
        status: 'available',
        description: 'Како да ги направите вашите упити побрзи и поефикасни'
      },
      
      // Past sessions
      {
        title: 'Диференцијално сметање',
        subject: 'Математика 1',
        level: 'Beginner',
        date: lastWeek,
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        tutor: tutors[0]._id,
        student: students[0]._id,
        status: 'completed',
        description: 'Извод, диференцијали и примени',
        notes: 'Студентот добро ги разбра концептите'
      },
      {
        title: 'Сортирање и пребарување',
        subject: 'Алгоритми и податочни структури',
        level: 'Intermediate',
        date: lastMonth,
        startTime: '11:00',
        endTime: '12:30',
        duration: 90,
        tutor: tutors[1]._id,
        student: students[1]._id,
        status: 'completed',
        description: 'QuickSort, MergeSort, бинарно пребарување',
        notes: 'Одлична сесија, студентот активно учествуваше'
      },
      {
        title: 'Процеси и нишки',
        subject: 'Операциски системи',
        level: 'Advanced',
        date: lastMonth,
        startTime: '13:00',
        endTime: '14:00',
        duration: 60,
        tutor: tutors[2]._id,
        student: students[0]._id,
        status: 'cancelled',
        description: 'Синхронизација и комуникација помеѓу процеси',
        notes: 'Сесијата беше откажана поради болест'
      }
    ];

    const createdSessions = await Session.insertMany(testSessions);
    console.log(`Created ${createdSessions.length} test sessions:`);
    
    createdSessions.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.subject} - ${session.status} (${session.date.toDateString()})`);
    });

    console.log('\nTest sessions created successfully!');
    
  } catch (error) {
    console.error('Error creating test sessions:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestSessions();
