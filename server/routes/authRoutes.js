const express = require('express');
const { signup, login, forgotPassword, resetPassword, refreshAccessToken, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

module.exports = router;
