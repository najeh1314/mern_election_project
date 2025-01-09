const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const authenticateToken = require('../middlewares/AuthenticateToken');



// Public Routes
router.post('/new-user', userController.register);
router.post('/log-in', userController.logIn);
router.get('/show-results/:id', userController.getVoteResults);
router.post('/comment', userController.comment);
router.get('/candidats', userController.getAllCondidate);
router.get('/elections', userController.getElections);
router.post('/election', userController.getElection);

//Private Routes
router.post('/vote', authenticateToken, userController.voter);
router.get('/unsubscribe', authenticateToken, userController.unsubscribe);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/update', authenticateToken, userController.updateProfile); 

module.exports = router;