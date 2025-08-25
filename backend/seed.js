const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Session = require('./models/Session');
const Availability = require('./models/Availability');
require('dotenv').config();

const PLAIN_PASSWORD = 'password123';

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutoring_app';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      Availability.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user with plain password (pre-save hook will hash it)
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create sample tutors with plain passwords
    const tutor1 = await User.create({
      name: 'Марко Петровски',
      email: 'marko.petrovski@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'tutor',
      studentIndex: '151023',
      bio: 'Искусен тутор по програмирање и алгоритми со 5 години искуство во образованието.',
      subjects: ['Структурно програмирање', 'Објектно-ориентирано програмирање', 'Алгоритми и податочни структури', 'Веб програмирање']
    });
    const tutor2 = await User.create({
      name: 'Ана Стојановска',
      email: 'ana.stojanovska@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'tutor',
      studentIndex: '141087',
      bio: 'Специјалист по бази на податоци и софтверско инженерство.',
      subjects: ['Бази на податоци', 'Софтверско инженерство', 'Дизајн на интеракцијата човек-компјутер', 'Управување со ИКТ проекти']
    });
    const tutor3 = await User.create({
      name: 'Никола Јовановски',
      email: 'nikola.jovanovski@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'tutor',
      studentIndex: '131045',
      bio: 'Експерт по вештачка интелигенција и машинско учење.',
      subjects: ['Вештачка интелигенција', 'Машинско учење', 'Вовед во науката за податоци', 'Податочно рударство']
    });
    const tutor4 = await User.create({
      name: 'Елена Трајковска',
      email: 'elena.trajkovska@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'tutor',
      studentIndex: '161092',
      bio: 'Специјалист по мрежи, безбедност и оперативни системи.',
      subjects: ['Компјутерски мрежи и безбедност', 'Оперативни системи', 'Информациска безбедност', 'Администрација на системи']
    });
    const tutor5 = await User.create({
      name: 'Димитар Николовски',
      email: 'dimitar.nikolovski@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'tutor',
      studentIndex: '171034',
      bio: 'Тутор по математика и дискретни структури.',
      subjects: ['Дискретна математика', 'Калкулус', 'Линеарна алгебра и примени', 'Бизнис статистика']
    });

    const student1 = await User.create({
      name: 'Стефан Илиевски',
      email: 'stefan.ilievski@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'student',
      studentIndex: '201156'
    });
    const student2 = await User.create({
      name: 'Милица Георгиевска',
      email: 'milica.georgievska@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'student',
      studentIndex: '201089'
    });
    const student3 = await User.create({
      name: 'Александар Стефановски',
      email: 'aleksandar.stefanovski@students.finki.ukim.mk',
      password: PLAIN_PASSWORD,
      role: 'student',
      studentIndex: '201134'
    });

    // Create sample sessions with FINKI subjects
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
    const inTwoDays = new Date(); inTwoDays.setDate(inTwoDays.getDate() + 2);

    const sessions = [
      {
        title: 'Основи на структурно програмирање',
        description: 'Учење на основните концепти на програмирање во C/C++.',
        subject: 'Структурно програмирање',
        tutor: tutor1._id,
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        status: 'available'
      },
      {
        title: 'Алгоритми за сортирање и пребарување',
        description: 'Анализа на алгоритми за сортирање и техники за пребарување.',
        subject: 'Алгоритми и податочни структури',
        tutor: tutor1._id,
        date: tomorrow,
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        status: 'available'
      },
      {
        title: 'Релациони бази на податоци',
        description: 'Дизајн на релациони бази, SQL заявки и нормализација.',
        subject: 'Бази на податоци',
        tutor: tutor2._id,
        date: nextWeek,
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        status: 'available'
      },
      {
        title: 'Вовед во вештачка интелигенција',
        description: 'Основни концепти на ВИ и алгоритми за пребарување.',
        subject: 'Вештачка интелигенција',
        tutor: tutor3._id,
        date: nextWeek,
        startTime: '16:00',
        endTime: '17:30',
        duration: 90,
        status: 'available'
      },
      {
        title: 'Објектно-ориентирано програмирање - ООП концепти',
        description: 'Класи, објекти, наследување и полиморфизам.',
        subject: 'Објектно-ориентирано програмирање',
        tutor: tutor1._id,
        date: inTwoDays,
        startTime: '11:00',
        endTime: '12:30',
        duration: 90,
        student: student1._id,
        status: 'booked'
      },
      {
        title: 'Мрежна безбедност и криптографија',
        description: 'Техники за безбедност на мрежи и основи на криптографија.',
        subject: 'Компјутерски мрежи и безбедност',
        tutor: tutor4._id,
        date: nextWeek,
        startTime: '13:00',
        endTime: '14:30',
        duration: 90,
        status: 'available'
      },
      {
        title: 'Дискретна математика - Графови и комбинаторика',
        description: 'Теорија на графови и комбинаторни проблеми.',
        subject: 'Дискретна математика',
        tutor: tutor5._id,
        date: tomorrow,
        startTime: '15:00',
        endTime: '16:00',
        duration: 60,
        status: 'available'
      },
      {
        title: 'Машинско учење - Супервизирано учење',
        description: 'Алгоритми за супервизирано учење и нивна примена.',
        subject: 'Машинско учење',
        tutor: tutor3._id,
        date: inTwoDays,
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        student: student2._id,
        status: 'booked'
      }
    ];

    // Rebuild original sessions array using new user refs
    sessions.length = 0;
    sessions.push(
      { title:'Основи на структурно програмирање', description:'Учење на основните концепти на програмирање во C/C++.', subject:'Структурно програмирање', tutor:tutor1._id, date:tomorrow, startTime:'10:00', endTime:'11:30', duration:90, status:'available' },
      { title:'Алгоритми за сортирање и пребарување', description:'Анализа на алгоритми за сортирање и техники за пребарување.', subject:'Алгоритми и податочни структури', tutor:tutor1._id, date:tomorrow, startTime:'14:00', endTime:'15:30', duration:90, status:'available' },
      { title:'Релациони бази на податоци', description:'Дизајн на релациони бази, SQL заявки и нормализација.', subject:'Бази на податоци', tutor:tutor2._id, date:nextWeek, startTime:'09:00', endTime:'10:30', duration:90, status:'available' },
      { title:'Вовед во вештачка интелигенција', description:'Основни концепти на ВИ и алгоритми за пребарување.', subject:'Вештачка интелигенција', tutor:tutor3._id, date:nextWeek, startTime:'16:00', endTime:'17:30', duration:90, status:'available' },
      { title:'Објектно-ориентирано програмирање - ООП концепти', description:'Класи, објекти, наследување и полиморфизам.', subject:'Објектно-ориентирано програмирање', tutor:tutor1._id, date:inTwoDays, startTime:'11:00', endTime:'12:30', duration:90, student:student1._id, status:'booked' },
      { title:'Мрежна безбедност и криптографија', description:'Техники за безбедност на мрежи и основи на криптографија.', subject:'Компјутерски мрежи и безбедност', tutor:tutor4._id, date:nextWeek, startTime:'13:00', endTime:'14:30', duration:90, status:'available' },
      { title:'Дискретна математика - Графови и комбинаторика', description:'Теорија на графови и комбинаторни проблеми.', subject:'Дискретна математика', tutor:tutor5._id, date:tomorrow, startTime:'15:00', endTime:'16:00', duration:60, status:'available' },
      { title:'Машинско учење - Супервизирано учење', description:'Алгоритми за супервизирано учење и нивна примена.', subject:'Машинско учење', tutor:tutor3._id, date:inTwoDays, startTime:'10:00', endTime:'11:30', duration:90, student:student2._id, status:'booked' }
    );

    await Session.insertMany(sessions);

    // Availability stays the same logic wise
    const availabilityData = [
      { tutor:tutor1._id, dayOfWeek:'monday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor1._id, dayOfWeek:'tuesday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor1._id, dayOfWeek:'wednesday', startTime:'10:00', endTime:'16:00', isRecurring:true, isAvailable:true },
      { tutor:tutor1._id, dayOfWeek:'thursday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor1._id, dayOfWeek:'friday', startTime:'09:00', endTime:'15:00', isRecurring:true, isAvailable:true },
      { tutor:tutor2._id, dayOfWeek:'monday', startTime:'08:00', endTime:'18:00', isRecurring:true, isAvailable:true },
      { tutor:tutor2._id, dayOfWeek:'tuesday', startTime:'08:00', endTime:'18:00', isRecurring:true, isAvailable:true },
      { tutor:tutor2._id, dayOfWeek:'wednesday', startTime:'08:00', endTime:'18:00', isRecurring:true, isAvailable:true },
      { tutor:tutor2._id, dayOfWeek:'thursday', startTime:'08:00', endTime:'18:00', isRecurring:true, isAvailable:true },
      { tutor:tutor2._id, dayOfWeek:'saturday', startTime:'10:00', endTime:'14:00', isRecurring:true, isAvailable:true },
      { tutor:tutor3._id, dayOfWeek:'monday', startTime:'10:00', endTime:'19:00', isRecurring:true, isAvailable:true },
      { tutor:tutor3._id, dayOfWeek:'wednesday', startTime:'10:00', endTime:'19:00', isRecurring:true, isAvailable:true },
      { tutor:tutor3._id, dayOfWeek:'friday', startTime:'10:00', endTime:'19:00', isRecurring:true, isAvailable:true },
      { tutor:tutor3._id, dayOfWeek:'saturday', startTime:'09:00', endTime:'15:00', isRecurring:true, isAvailable:true },
      { tutor:tutor4._id, dayOfWeek:'tuesday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor4._id, dayOfWeek:'wednesday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor4._id, dayOfWeek:'thursday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor4._id, dayOfWeek:'friday', startTime:'09:00', endTime:'17:00', isRecurring:true, isAvailable:true },
      { tutor:tutor5._id, dayOfWeek:'monday', startTime:'08:00', endTime:'16:00', isRecurring:true, isAvailable:true },
      { tutor:tutor5._id, dayOfWeek:'tuesday', startTime:'08:00', endTime:'16:00', isRecurring:true, isAvailable:true },
      { tutor:tutor5._id, dayOfWeek:'wednesday', startTime:'08:00', endTime:'16:00', isRecurring:true, isAvailable:true },
      { tutor:tutor5._id, dayOfWeek:'thursday', startTime:'08:00', endTime:'16:00', isRecurring:true, isAvailable:true },
      { tutor:tutor5._id, dayOfWeek:'saturday', startTime:'09:00', endTime:'13:00', isRecurring:true, isAvailable:true }
    ];

    await Availability.insertMany(availabilityData);

    console.log('Sample data created successfully!');
    console.log('\nTest accounts (passwords use common seed password unless noted):');
    console.log('Admin: admin@example.com / admin123');
    console.log('Common user password:', PLAIN_PASSWORD);
    console.log('Tutor emails:', tutor1.email, tutor2.email, tutor3.email, tutor4.email, tutor5.email);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
