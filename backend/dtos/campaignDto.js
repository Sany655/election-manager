const { body } = require('express-validator');

const createCampaignValidationRules = () => {
    return [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required'),
        body('startDate')
            .notEmpty()
            .withMessage('Start date is required')
            .isISO8601()
            .withMessage('Start date must be a valid date'),
        body('endDate')
            .notEmpty()
            .withMessage('End date is required')
            .isISO8601()
            .withMessage('End date must be a valid date')
            .custom((value, { req }) => {
                if (new Date(value) <= new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            }),
        body('typeList')
            .isArray({ min: 1 })
            .withMessage('At least one campaign type is required'),
    ];
};

const updateCampaignValidationRules = () => {
    return [
        body('title')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Title cannot be empty'),
        body('startDate')
            .optional()
            .isISO8601()
            .withMessage('Start date must be a valid date'),
        body('endDate')
            .optional()
            .isISO8601()
            .withMessage('End date must be a valid date')
            .custom((value, { req }) => {
                // If both dates are provided, check them
                if (value && req.body.startDate) {
                    if (new Date(value) <= new Date(req.body.startDate)) {
                        throw new Error('End date must be after start date');
                    }
                }
                return true;
            }),
        body('typeList')
            .optional()
            .isArray({ min: 1 })
            .withMessage('At least one campaign type is required'),
    ];
};

module.exports = {
    createCampaignValidationRules,
    updateCampaignValidationRules
};
