const { body, param } = require('express-validator');

/**
 * Create Resource Validation
 */
const createResourceValidationRules = () => [
  body('name')
    .notEmpty().withMessage('Resource name is required')
    .isString().withMessage('Resource name must be a string')
    .isLength({ min: 2 }).withMessage('Resource name must be at least 2 characters'),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string'),

  body('unit')
    .optional()
    .isString().withMessage('Unit must be a string'),

  body('rate_per_day')
    .notEmpty().withMessage('rate_per_day is required')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('rate_per_day must be a valid decimal number'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be boolean')
];

/**
 * Update Resource Validation
 */
const updateResourceValidationRules = () => [
  param('id')
    .isInt().withMessage('Resource ID must be a valid integer'),

  body('name')
    .optional()
    .isString().withMessage('Resource name must be a string'),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string'),

  body('unit')
    .optional()
    .isString().withMessage('Unit must be a string'),

  body('rate_per_day')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('rate_per_day must be a valid decimal number'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be boolean')
];

/**
 * Resource ID Validation (GET / DELETE)
 */
const resourceIdValidationRules = () => [
  param('id')
    .isInt().withMessage('Resource ID must be a valid integer')
];

module.exports = {
  createResourceValidationRules,
  updateResourceValidationRules,
  resourceIdValidationRules
};