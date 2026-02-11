const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.get('/login', authController.loginPage);
router.post('/authenticate', authController.login);

router.get('/signup', authController.signupPage);
router.post('/register', authController.signup);

router.get('/logout', authController.logout);

module.exports = router;
