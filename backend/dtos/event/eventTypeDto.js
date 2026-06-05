const { body, param } = require('express-validator');

const createEventTypeValidationRules = (title) => {
    return [
        body('name')
            .trim()
            .escape()
            .notEmpty()
            .withMessage(`${title} name is required`),

        body('description')
            .optional()
            .trim()
            .escape()
    ];
};

const updateEventTypeValidationRules = (title) => {
    return [
        param('id')
            .notEmpty()
            .withMessage(`${title} ID is required`)
            .isInt({ gt: 0 })
            .withMessage(`${title} ID must be a positive integer`),

        body('name')
            .optional()
            .trim()
            .escape()
            .notEmpty()
            .withMessage(`${title} name cannot be empty`),

        body('description')
            .optional()
            .trim()
            .escape()
    ];
};

const deleteEventTypeValidationRules = (title) => {
    return [
        param('id')
            .notEmpty()
            .withMessage(`${title} ID is required`)
            .isInt({ gt: 0 })
            .withMessage(`${title} ID must be a positive integer`)
    ];
};

module.exports = {
    createEventTypeValidationRules,
    updateEventTypeValidationRules,
    deleteEventTypeValidationRules
};
