const express = require("express");
const { getAllTutors } = require("../controllers/tutorController");

const router = express.Router();

router.get("/", getAllTutors);

module.exports = router;
