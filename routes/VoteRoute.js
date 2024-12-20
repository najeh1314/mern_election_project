const express = require("express");
const router = express.Router();
const VoteController = require("../controllers/VoteController");
const authenticateToken = require('../middlewares/AuthenticateToken');



// Public Routes
router.post('/vote', authenticateToken , VoteController.voter);

module.exports = router;