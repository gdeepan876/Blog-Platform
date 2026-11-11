const express = require('express');
const AuthController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// 15 login attempts per 15 minutes
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

router.post('/register', AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);

module.exports = router;

