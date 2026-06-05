const { body, param } = require('express-validator');

const createAreaValidationRules = () => {
    return [
        body('area_name').trim().escape().notEmpty().withMessage('Area Name is required'),
        body('location_id')
            .notEmpty().withMessage('Region ID is required')
            .bail()
            .toInt()
            .isInt({ gt: 0 }).withMessage('Region ID must be a positive integer'),
    ]
}

const deleteAreaValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Area ID is required')
            .isInt({ gt: 0 }).withMessage('Area ID must be a positive integer'),
    ];
};


module.exports = { createAreaValidationRules, deleteAreaValidationRules }