const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createRffValidationRules, deleteRffValidationRules } = require('../dtos/rffDto');
const { createRffPoint, deleteRffPointPermanently, editRffPoint, getRffPoints } = require('../controllers/rffController');


router.route('/').post(protect, authorize('admin', 'super-admin'), createRffValidationRules(), validator, createRffPoint);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'), deleteRffValidationRules(), validator, deleteRffPointPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editRffPoint);
router.route('/').get(protect, getRffPoints);

module.exports = router;
