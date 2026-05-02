// routes/authRoutes.js
// Routes d'authentification

const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/login', login);       // POST /api/auth/login
router.post('/register', register); // POST /api/auth/register
router.get('/me', protect, getMe);  // GET  /api/auth/me

module.exports = router;