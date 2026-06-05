const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createPolicy, getPolicies, deletePolicyPermanently, editPolicy, assignPolicy } = require('../controllers/attendancePolicyController');



router.route('/').post(protect, authorize('admin', 'super-admin'), createPolicy);
router.route('/assign').post(protect, assignPolicy);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'),  deletePolicyPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editPolicy);
router.route('/').get(protect, getPolicies);

module.exports = router;
