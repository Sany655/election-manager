const { body, param } = require('express-validator');

const createDepartmentValidationRules = () => {
    return [
        body('department_name').trim().escape().notEmpty().withMessage('Department Name is required'),
    ]
}

const deleteDepartmentValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Department ID is required')
            .isInt({ gt: 0 }).withMessage('Department ID must be a positive integer'),
    ];
};


module.exports = { createDepartmentValidationRules, deleteDepartmentValidationRules }