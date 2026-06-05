const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');

const {
  assignEventResourceValidationRules,
  updateEventResourceValidationRules,
  eventResourceIdValidationRules,
  eventIdParamValidationRules
} = require('../dtos/eventResourceDto');

const {
  assignResourceToEvent,
  getResourcesByEvent,
  updateEventResource,
  deleteEventResource
} = require('../controllers/eventResourceController');

// Assign resource to event
router.post(
  '/',
  protect,
  authorize('admin', 'super-admin'),
  assignEventResourceValidationRules(),
  validator,
  assignResourceToEvent
);

// Get all resources for an event
router.get(
  '/event/:eventId',
  optionalAuth,
  eventIdParamValidationRules(),
  validator,
  getResourcesByEvent
);

// Update assigned resource
router.patch(
  '/:id',
  protect,
  authorize('admin', 'super-admin'),
  updateEventResourceValidationRules(),
  validator,
  updateEventResource
);

// Remove resource from event
router.delete(
  '/:id',
  protect,
  authorize('admin', 'super-admin'),
  eventResourceIdValidationRules(),
  validator,
  deleteEventResource
);

module.exports = router;