const { body, param } = require('express-validator');

const createPolicyValidationRules = () => {
    return [
        body('name').trim().escape().notEmpty().withMessage('Policy Name is required'),
        body('Policy_address',).notEmpty().withMessage('Address is required')
            .trim(),
        body('company_id')
            .optional()
            .isInt().withMessage('Company Id must be a valid integer'),
        body('area_id')
            .optional()
            .isInt().withMessage('Area id must be a valid integer'),
    ]
}

const deletePolicyValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Policy ID is required')
            .isInt({ gt: 0 }).withMessage('Policy ID must be a positive integer'),
    ];
};


module.exports = { createPolicyValidationRules, deletePolicyValidationRules }