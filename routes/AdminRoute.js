const express = require("express");
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken');
const checkAdmin = require("../middlewares/CheckAdmin");
const adminController = require("../controllers/AdminController");

router.get('/all-users', authenticateToken, checkAdmin, adminController.findAllUsers);
router.delete('/delete-user/:id', authenticateToken, checkAdmin, adminController.deleteUser);


module.exports = router;