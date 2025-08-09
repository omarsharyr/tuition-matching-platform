const Tutor = require('../models/Tutor');

const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.status(200).json(tutors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutors', error: err });
  }
};

module.exports = { getAllTutors };
