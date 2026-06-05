const { body, param } = require('express-validator');

const createEventTargetGroupValidationRules = (title) => {
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

const updateEventTargetGroupValidationRules = (title) => {
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

const deleteEventTargetGroupValidationRules = (title) => {
    return [
        param('id')
            .notEmpty()
            .withMessage(`${title} ID is required`)
            .isInt({ gt: 0 })
            .withMessage(`${title} ID must be a positive integer`)
    ];
};

module.exports = {
    createEventTargetGroupValidationRules,
    updateEventTargetGroupValidationRules,
    deleteEventTargetGroupValidationRules
};
