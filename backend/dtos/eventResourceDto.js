const { body, param } = require('express-validator');

/**
 * Assign Resource to Event
 * POST /api/event-resources
 */
const assignEventResourceValidationRules = () => [
  body('event_id')
    .notEmpty().withMessage('event_id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('event_id must be a valid integer'),

  body('resource_id')
    .notEmpty().withMessage('resource_id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('resource_id must be a valid integer'),

  body('quantity')
    .notEmpty().withMessage('quantity is required')
    .bail()
    .isInt({ min: 1 }).withMessage('quantity must be at least 1'),

  body('days')
    .notEmpty().withMessage('days is required')
    .bail()
    .isInt({ min: 1 }).withMessage('days must be at least 1')
];

/**
 * Update Assigned Resource
 * PATCH /api/event-resources/:id
 */
const updateEventResourceValidationRules = () => [
  param('id')
    .isInt({ min: 1 }).withMessage('Assignment ID must be a valid integer'),

  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('quantity must be at least 1'),

  body('days')
    .optional()
    .isInt({ min: 1 }).withMessage('days must be at least 1')
];

/**
 * Delete / Get by ID
 * DELETE /api/event-resources/:id
 */
const eventResourceIdValidationRules = () => [
  param('id')
    .isInt({ min: 1 }).withMessage('Assignment ID must be a valid integer')
];

/**
 * Get resources by event
 * GET /api/event-resources/event/:eventId
 */
const eventIdParamValidationRules = () => [
  param('eventId')
    .isInt({ min: 1 }).withMessage('eventId must be a valid integer')
];

module.exports = {
  assignEventResourceValidationRules,
  updateEventResourceValidationRules,
  eventResourceIdValidationRules,
  eventIdParamValidationRules
};