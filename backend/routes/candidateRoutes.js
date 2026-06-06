const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getProfile,
  updateProfile
} = require('../controllers/candidateController');

const { protect, checkPermission, authorize } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const dir = 'uploads/images/candidates';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/candidates/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${file.fieldname}_${uniqueSuffix}_${sanitizedOriginalName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
  }
};

const uploadMultiple = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
]);

// Admin Routes
router.get('/', protect, authorize('admin', 'super-admin'), getAllCandidates);
router.post('/', protect, authorize('admin', 'super-admin'), uploadMultiple, createCandidate);
router.get('/:id', protect, authorize('admin', 'super-admin'), getCandidateById);
router.put('/:id', protect, authorize('admin', 'super-admin'), uploadMultiple, updateCandidate);
router.delete('/:id', protect, authorize('admin', 'super-admin'), deleteCandidate);

// Portal Routes (Candidate only)
router.get('/profile/me', protect, authorize('candidate'), getProfile);
router.put('/profile/me', protect, authorize('candidate'), uploadMultiple, updateProfile);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        msg: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
        success: false,
        msg: error.message
    });
  }
  
  next(error);
});

module.exports = router;
