const express = require('express');
const router = express.Router();

const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { employeeFingerprintRegisterValidationRules } = require('../dtos/employeeDto');
const { getPingFromDevice, getDevices, deleteDevicePermanently } = require('../controllers/deviceController');


router.route('/ping').post(protect, checkPermission(['take-attendance','take-manual-attendance','enroll-fingerprints']), getPingFromDevice)
router.route('/').get(protect, checkPermission(['take-attendance','take-manual-attendance','enroll-fingerprints']), getDevices)
router.route('/:id/delete').delete(protect, checkPermission(['delete-device']), deleteDevicePermanently)

module.exports = router;
