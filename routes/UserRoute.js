const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const authenticateToken = require('../middlewares/AuthenticateToken');



// Public Routes
router.post('/new-user', userController.register);
router.post('/log-in', userController.logIn);
router.get('/show-results/:id', userController.getVoteResults);
router.post('/comment', userController.comment);

//Private Routes
router.post('/vote', authenticateToken, userController.voter);
router.get('/unsubscribe', authenticateToken, userController.unsubscribe);

module.exports = router;