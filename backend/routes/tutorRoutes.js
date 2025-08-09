const express = require('express');
const router = express.Router();
const { getAllTutors } = require('../controllers/tutorController');

router.get('/', getAllTutors);

module.exports = router;
