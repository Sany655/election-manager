const { param } = require('express-validator');

/**
 * Validate Event ID for cost summary
 * GET /api/event-cost/:eventId
 */
const eventCostValidationRules = () => [
  param('eventId')
    .notEmpty()
    .withMessage('eventId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('eventId must be a valid positive integer')
];

module.exports = {
  eventCostValidationRules
};