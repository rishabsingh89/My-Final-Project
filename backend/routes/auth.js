const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  googleLogin,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/me', protect, uploadImage.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
