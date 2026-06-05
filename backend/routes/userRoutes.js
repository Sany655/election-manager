const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const {
  getProfile,
  login,
  register,
  getAll,
  getOne,
  getAllRoles,
  deleteUserPermanently,
  registerEmployee,
  registerEmployeeFingerprint,
  editEmployee,
  createRole,
  deleteRolePermanently,
  createPermission,
  deletPermissionPermanently,
  getAllPermissions,
  getAllFingerprints,
  editRole,
  // New controllers for personal details and documents
  getEmployeePersonalDetails,
  updateEmployeePersonalDetails,
  getEmployeeDocuments,
  updateEmployeeDocuments,
  verifyEmployeeDocuments,
  getEmployeeFullProfile,
  processMasterData
} = require('../controllers/userController');

const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');

// Validation DTOs
const loginValidationRules = require('../dtos/loginDto');
const {
  employeeRegisterValidationRules,
  employeeFingerprintRegisterValidationRules,
  employeeUpdateValidationRules,
  employeePersonalDetailsValidationRules,
  employeeDocumentVerificationRules
} = require('../dtos/employeeDto');

const {
  createRoleValidationRules,
  deleteRoleValidationRules
} = require('../dtos/roleDto');

const {
  createPermissiomValidationRules,
  deletePermissionValidationRules
} = require('../dtos/permissionDto');

// Ensure upload directories exist
const createUploadDirectories = () => {
  const directories = [
    'uploads/images/users',
    'uploads/documents/cv',
    'uploads/documents/nid',
    'uploads/documents/certificates',
    'uploads/documents/clearance',
    'uploads/documents/guarantor',
    'uploads/documents/medical',
    'uploads/documents/banking',
    'uploads/documents/users'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
createUploadDirectories();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/images/users/'; // default
    
    switch (file.fieldname) {
      case 'image':
      case 'avatar':
        uploadPath = 'uploads/images/users/';
        break;
      case 'cv':
        uploadPath = 'uploads/documents/cv/';
        break;
      case 'nid':
      case 'passport':
      case 'driving_license':
      case 'birth_certificate':
      case 'parents_nid':
      case 'spouse_nid':
      case 'guarantor_nid':
        uploadPath = 'uploads/documents/nid/';
        break;
      case 'educational_docs':
      case 'degree_certificate':
      case 'transcript':
        uploadPath = 'uploads/documents/certificates/';
        break;
      case 'job_clearance':
      case 'experience_certificate':
      case 'salary_certificate':
        uploadPath = 'uploads/documents/clearance/';
        break;
      case 'guarantor_docs':
        uploadPath = 'uploads/documents/guarantor/';
        break;
      case 'medical_certificate':
      case 'vaccination_certificate':
        uploadPath = 'uploads/documents/medical/';
        break;
      case 'bank_statement':
      case 'cheque_leaf':
        uploadPath = 'uploads/documents/banking/';
        break;
      case 'master_data':
        uploadPath = 'uploads/documents/users/';
        break;
      default:
        uploadPath = 'uploads/documents/misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${file.fieldname}_${uniqueSuffix}_${sanitizedOriginalName}`);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images and PDF/DOC files are allowed.`), false);
  }
};

// Multer configurations
const uploadSingle = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadMultiple = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'nid', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'driving_license', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'job_clearance', maxCount: 1 },
  { name: 'experience_certificate', maxCount: 1 },
  { name: 'salary_certificate', maxCount: 1 },
  { name: 'educational_docs', maxCount: 1 },
  { name: 'degree_certificate', maxCount: 1 },
  { name: 'transcript', maxCount: 1 },
  { name: 'guarantor_docs', maxCount: 1 },
  { name: 'guarantor_nid', maxCount: 1 },
  { name: 'parents_nid', maxCount: 1 },
  { name: 'spouse_nid', maxCount: 1 },
  { name: 'medical_certificate', maxCount: 1 },
  { name: 'vaccination_certificate', maxCount: 1 },
  { name: 'bank_statement', maxCount: 1 },
  { name: 'cheque_leaf', maxCount: 1 },
  { name: 'master_data', maxCount: 1 }
]);

/* -------------------- AUTH -------------------- */
router.post('/login', loginValidationRules(), validator, login);

/* -------------------- PERMISSIONS -------------------- */
router.get('/permissions', protect, authorize('admin', 'super-admin'), getAllPermissions);
router.post(
  '/permissions',
  protect,
  authorize('admin', 'super-admin'),
  createPermissiomValidationRules(),
  validator,
  createPermission
);
router.delete(
  '/permissions/:id/delete',
  protect,
  authorize('admin', 'super-admin'),
  deletePermissionValidationRules(),
  validator,
  deletPermissionPermanently
);

/* -------------------- ROLES -------------------- */
router.get('/roles', protect, getAllRoles);
router.post(
  '/roles',
  protect,
  authorize('admin', 'super-admin'),
  createRoleValidationRules(),
  validator,
  createRole
);
router.patch(
  '/roles/:id',
  protect,
  authorize('admin', 'super-admin'),
  deleteRoleValidationRules(),
  validator,
  editRole
);
router.delete(
  '/roles/:id/delete',
  protect,
  authorize('admin', 'super-admin'),
  deleteRoleValidationRules(),
  validator,
  deleteRolePermanently
);

/* -------------------- EMPLOYEES MANAGEMENT -------------------- */
// Create new employee with all details
router.post(
  '/register-employee',
  protect,
  authorize('admin', 'super-admin'),
  uploadMultiple,
  employeeRegisterValidationRules(),
  validator,
  registerEmployee
);

// Update employee (all tables)
router.patch(
  '/employee/:id',
  protect,
  authorize('admin', 'super-admin'),
  uploadMultiple,
  employeeUpdateValidationRules(),
  validator,
  editEmployee
);

// Get employee full profile (all tables joined)
// router.get(
//   '/employee/:id/profile',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   getEmployeeFullProfile
// );

/* -------------------- EMPLOYEE PERSONAL DETAILS -------------------- */
// Get employee personal details
// router.get(
//   '/employee/:id/personal-details',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   getEmployeePersonalDetails
// );

// // Update employee personal details only
// router.patch(
//   '/employee/:id/personal-details',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   employeePersonalDetailsValidationRules(),
//   validator,
//   updateEmployeePersonalDetails
// );

/* -------------------- EMPLOYEE DOCUMENTS -------------------- */
// Get employee documents
// router.get(
//   '/employee/:id/documents',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   getEmployeeDocuments
// );

// Update employee documents
// router.patch(
//   '/employee/:id/documents',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   uploadMultiple,
//   updateEmployeeDocuments
// );

// Verify employee documents
// router.patch(
//   '/employee/:id/documents/verify',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   employeeDocumentVerificationRules(),
//   validator,
//   verifyEmployeeDocuments
// );

/* -------------------- FINGERPRINT MANAGEMENT -------------------- */
router.patch(
  '/register-fingerprint',
  protect,
  checkPermission(['enroll-fingerprints']),
  employeeFingerprintRegisterValidationRules(),
  validator,
  registerEmployeeFingerprint
);

/* -------------------- USERS BASIC OPERATIONS -------------------- */
router.get('/', protect, getAll);
router.get('/fingerprints', protect, checkPermission(['enroll-fingerprints']), getAllFingerprints);
router.get('/me', protect, getProfile);
router.post(
  '/register',
  protect,
  authorize('admin', 'super-admin'),
  loginValidationRules(),
  validator,
  register
);

/* -------------------- REPORTING ROUTES -------------------- */
// Employee reports and analytics
// router.get(
//   '/reports/birthdays',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   (req, res, next) => {
//     req.reportType = 'birthdays';
//     next();
//   },
//   getEmployeeReports
// );

// router.get(
//   '/reports/blood-group/:group',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   (req, res, next) => {
//     req.reportType = 'blood-group';
//     next();
//   },
//   getEmployeeReports
// );

// router.get(
//   '/reports/incomplete-profiles',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   (req, res, next) => {
//     req.reportType = 'incomplete-profiles';
//     next();
//   },
//   getEmployeeReports
// );

// router.get(
//   '/reports/document-verification',
//   protect,
//   authorize('admin', 'super-admin', 'hr'),
//   (req, res, next) => {
//     req.reportType = 'document-verification';
//     next();
//   },
//   getEmployeeReports
// );

/* -------------------- PARAMETERIZED ROUTES (KEEP LAST) -------------------- */
router.get('/:id', protect, getOne);
router.delete('/:id/delete', protect, authorize('admin', 'super-admin'), deleteUserPermanently);


/* process excel */
// Update employee (all tables)
router.post(
  '/employee/master-data/process',
  protect,
  // uploadMultiple,
  processMasterData
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        msg: 'File too large. Maximum size is 5MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        msg: 'Too many files uploaded.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      msg: error.message
    });
  }
  
  next(error);
});

module.exports = router;