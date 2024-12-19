const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const authenticateToken = require('../middlewares/AuthenticateToken');



// Public Routes
router.post('/new-user', userController.register);
router.post('/log-in', userController.logIn);

//Private Routes


module.exports = router;