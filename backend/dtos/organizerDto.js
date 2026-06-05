const { body, param } = require("express-validator");

/**
 * Create Organizer Validation
 */
exports.createOrganizerValidationRules = () => [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Organizer name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Organizer name must be between 2 and 100 characters"),

  body("type")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Type must be under 50 characters"),

  body("contact_person")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Contact person name must be under 100 characters"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("address")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Address must be under 255 characters"),

  body("status")
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage("Status must be 0 (inactive) or 1 (active)"),
];

/**
 * Update Organizer Validation
 */
exports.updateOrganizerValidationRules = () => [
  param("id")
    .isInt()
    .withMessage("Organizer ID must be a valid integer"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Organizer name must be between 2 and 100 characters"),

  body("type")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Type must be under 50 characters"),

  body("contact_person")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Contact person name must be under 100 characters"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("address")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Address must be under 255 characters"),

  body("status")
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage("Status must be 0 or 1"),
];

/**
 * Delete Organizer Validation
 */
exports.deleteOrganizerValidationRules = () => [
  param("id")
    .isInt()
    .withMessage("Organizer ID must be a valid integer"),
];