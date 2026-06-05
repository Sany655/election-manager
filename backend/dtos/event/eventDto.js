const { body, param } = require('express-validator');

const createEventValidationRules = (title) => {
    return [
        body('name').trim().escape().notEmpty().withMessage(`${title} Name is required`),
    ]
}

const deleteEventValidationRules = (title) => {
    return [
        param('id')
            .notEmpty().withMessage(`${title} ID is required`)
            .isInt({ gt: 0 }).withMessage(`${title} ID must be a positive integer`),
    ];
};


module.exports = { createEventValidationRules, deleteEventValidationRules }