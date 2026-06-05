const { body, param } = require('express-validator');

const employeeRegisterValidationRules = () => {
    return [
        // Debug middleware to see what's in req.body
        body('employee_id')
            .trim()
            .notEmpty()
            .withMessage('Employee ID is required'),

        body('name')
            .trim()
            .notEmpty()
            .withMessage('Employee name is required'),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required'),

        body('role')
            .notEmpty()
            .withMessage('Role is required'),
    ];
};
const employeeUpdateValidationRules = () => {

    return [
        param('id')
            .notEmpty()
            .withMessage('Employee ID is required'),
        body('name')
            .optional()
            .isString().withMessage('Name must be a string')
            .trim(),

        body('email')
            .optional()
            .isEmail().withMessage('Please include a valid email')
            .trim(),

        body('password')
            .optional()
            .isString().withMessage('Password must be a string')
            .trim(),

        body('location_id')
            .optional()
            .isInt({ gt: 0 }).withMessage('Location Id must be a number'),

        body('company_id')
            .optional()
            .isInt({ gt: 0 }).withMessage('Company Id must be a number'),

        body('area_id')
            .optional()
            .isInt({ gt: 0 }).withMessage('Area Id must be a number')

    ]
}

const employeeFingerprintRegisterValidationRules = () => {

    return [
        body('employee_id')
            .notEmpty().withMessage('Employee Id is required')
            .isString().withMessage('Employee Id must be a string'),

    ]
}

module.exports = { employeeRegisterValidationRules, employeeUpdateValidationRules, employeeFingerprintRegisterValidationRules }