const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'user';
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(4).toString('hex');
    const safeFilename = `avatar_${userId}_${Date.now()}_${randomHex}${ext}`;
    cb(null, safeFilename);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
  const extValid = allowedExtensions.includes(ext);

  if (mimeTypeValid && extValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file format. Only JPG, JPEG, PNG, and WEBP images are allowed.'), false);
  }
};

// Multer upload middleware (5 MB max size)
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('avatar');

// Error wrapping middleware for standard JSON response
const uploadAvatarMiddleware = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image size exceeds maximum limit of 5 MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.'
      });
    }
    next();
  });
};

module.exports = { uploadAvatarMiddleware, uploadDir };
