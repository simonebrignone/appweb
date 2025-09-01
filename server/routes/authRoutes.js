const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  changePassword,
  changePasswordForced
} = require('../controllers/authController');

const checkBlacklist = require('../middlewares/checkBlacklist');

const router = express.Router();

// Rotte pubbliche
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/refresh-token', refreshAccessToken);

// Rotte protette (richiedono accessToken valido → controllato da checkBlacklist)
router.post('/change-password', checkBlacklist, changePassword);
router.post('/logout', checkBlacklist, logout);
router.post('/change-password-forced', changePasswordForced);

module.exports = router;
