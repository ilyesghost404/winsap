const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadAvatarMiddleware } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar
} = require('../controllers/profileController');

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
router.delete('/avatar', deleteAvatar);

module.exports = router;
