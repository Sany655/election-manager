const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');

const {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');

const {
  createResourceValidationRules,
  updateResourceValidationRules,
  resourceIdValidationRules
} = require('../dtos/resourceDto');

/**
 * @route   POST /api/resources
 * @desc    Create a new resource
 * @access  Admin / Super Admin
 */
router.post(
  '/',
  protect,
  authorize('admin', 'super-admin'),
  createResourceValidationRules(),
  validator,
  createResource
);

/**
 * @route   GET /api/resources
 * @desc    Get all resources
 * @access  Public (optional auth)
 */
router.get(
  '/',
  optionalAuth,
  getResources
);

/**
 * @route   GET /api/resources/:id
 * @desc    Get single resource by ID
 * @access  Public (optional auth)
 */
router.get(
  '/:id',
  optionalAuth,
  resourceIdValidationRules(),
  validator,
  getResourceById
);


/**
 * @route   PATCH /api/resources/:id
 * @desc    Update a resource
 * @access  Admin / Super Admin
 */
router.patch(
  '/:id',
  protect,
  authorize('admin', 'super-admin'),
  updateResourceValidationRules(),
  validator,
  updateResource
);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource (soft or hard based on controller)
 * @access  Admin / Super Admin
 */
router.delete(
  '/:id',
  protect,
  authorize('admin', 'super-admin'),
  resourceIdValidationRules(),
  validator,
  deleteResource
);

module.exports = router;