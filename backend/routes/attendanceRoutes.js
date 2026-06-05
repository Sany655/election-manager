const express = require('express');
const router = express.Router();

const { clockIn, clockOut, attendanceReport, getSummary, getSetPolicies } = require('../controllers/attendanceController');
const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { employeeFingerprintRegisterValidationRules } = require('../dtos/employeeDto');


router.route('/clock-in').post(protect, checkPermission(['take-attendance','take-manual-attendance']), employeeFingerprintRegisterValidationRules(), validator, clockIn)
router.route('/clock-out').post(protect, checkPermission(['take-attendance','take-manual-attendance']), employeeFingerprintRegisterValidationRules(), validator, clockOut)
router.route('/report').get(protect, attendanceReport)
// router.route('/report').get(protect,  checkPermission(['view-attendance-reports']), attendanceReport)
router.route('/summary').get(protect, getSummary)
router.route('/get-set-polices').get(protect, authorize('admin', 'super-admin'), getSetPolicies)


module.exports = router;
