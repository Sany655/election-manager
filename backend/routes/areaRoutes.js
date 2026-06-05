const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createArea, deleteAreaPermanently, editArea, getAreas } = require('../controllers/areaController');
const { createAreaValidationRules, deleteAreaValidationRules } = require('../dtos/areaDto');


router.route('/').post(protect, checkPermission(['view-areas']), createAreaValidationRules(), validator, createArea);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'), deleteAreaValidationRules(), validator, deleteAreaPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editArea);
router.route('/').get(protect, getAreas);

module.exports = router;
