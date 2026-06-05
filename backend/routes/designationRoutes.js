const express = require('express');
const router = express.Router();

const { protect, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createDesignationValidationRules, deleteDesignationValidationRules } = require('../dtos/designationDto');
const { createDesignation, deleteDesignationPermanently, editDesignation, getDesignations, assignDesignationBulk } = require('../controllers/designationController');

router.route('/').post(protect, checkPermission(['add-designations']), createDesignationValidationRules(), validator, createDesignation);
router.route('/:id/delete').delete(protect, checkPermission(['delete-designations']), deleteDesignationValidationRules(), validator, deleteDesignationPermanently);
router.route('/:id').patch(protect, checkPermission(['edit-designations']), editDesignation);
router.route('/assign').put(protect, checkPermission(['edit-designations']), assignDesignationBulk);
router.route('/').get(protect, checkPermission(['view-designations']), getDesignations);

module.exports = router;
