const User = require('../models/User');

const getAllTutors = async (req, res) => {
  try {
    const tutors = await User.find({
      role: 'tutor',
      isVerified: true,
      status: 'ACTIVE'
    }).select('-password');
    
    res.status(200).json(tutors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutors', error: err });
  }
};

module.exports = { getAllTutors };
