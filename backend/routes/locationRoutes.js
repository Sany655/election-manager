const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createLocation, deleteLocationPermanently, editLocation, getLocations } = require('../controllers/locationController');
const { createLocationValidationRules, deleteLocationValidationRules } = require('../dtos/locationDto');

//region -> Remark
router.route('/').post(protect, authorize('admin', 'super-admin'), createLocationValidationRules(), validator, createLocation);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'), deleteLocationValidationRules(), validator, deleteLocationPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editLocation);
router.route('/').get(protect, getLocations);

module.exports = router;
