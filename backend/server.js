const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const tutorRoutes = require('./routes/tutorRoutes');
const authRoutes = require('./routes/authRoutes'); // 🆕 Add this line

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tutors', tutorRoutes);
app.use('/api/auth', authRoutes); // 🆕 Add this line

// Test route (optional)
app.get('/', (req, res) => res.send("API running"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
