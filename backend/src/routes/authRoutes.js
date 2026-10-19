const express = require('express');
const { login, getBootstrapStatus, bootstrapAdmin, resetAdminPassword, changePassword, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/bootstrap-status', getBootstrapStatus);
router.post('/bootstrap-admin', bootstrapAdmin);
router.post('/reset-admin-password', resetAdminPassword);
router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
