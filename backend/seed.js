// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tutor = require('./models/Tutor');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');

  await Tutor.deleteMany();

  const dummyTutors = [
    {
      name: 'Sarah Ahmed',
      university: 'BRAC University',
      subjects: ['Math', 'Physics'],
      classes: ['9', '10'],
      location: 'Dhaka'
    },
    {
      name: 'Tanvir Hossain',
      university: 'NSU',
      subjects: ['Biology', 'Chemistry'],
      classes: ['6', '8'],
      location: 'Chittagong'
    },
    {
      name: 'Maliha Zaman',
      university: 'IUB',
      subjects: ['English', 'ICT'],
      classes: ['5', '7', '9'],
      location: 'Dhaka'
    }
  ];

  await Tutor.insertMany(dummyTutors);
  console.log('Dummy data inserted');
  process.exit();
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});
