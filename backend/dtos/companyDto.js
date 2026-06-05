const { body, param } = require('express-validator');

const createCompanyValidationRules = () => {
    return [
        body('company_name').trim().escape().notEmpty().withMessage('Company Name is required'),
        body('company_address',).notEmpty().withMessage('Address is required')
            .trim()
    ]
}

const deleteCompanyValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Company ID is required')
            .isInt({ gt: 0 }).withMessage('Company ID must be a positive integer'),
    ];
};


module.exports = { createCompanyValidationRules, deleteCompanyValidationRules }