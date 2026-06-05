const { body, param } = require('express-validator');

const createDesignationValidationRules = () => {
    return [
        body('designation_name').trim().escape().notEmpty().withMessage('Designation Name is required'),
    ]
}

const deleteDesignationValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Designation ID is required')
            .isInt({ gt: 0 }).withMessage('Designation ID must be a positive integer'),
    ];
};


module.exports = { createDesignationValidationRules, deleteDesignationValidationRules }