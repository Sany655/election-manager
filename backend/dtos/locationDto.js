const { body, param } = require('express-validator');

const createLocationValidationRules = () => {
    return [
        body('location_name').trim().escape().notEmpty().withMessage('Location Name is required'),
        body('team_id')
            .notEmpty().withMessage('Team ID is required')
            .bail()
            .toInt()
            .isInt({ gt: 0 }).withMessage('Team ID must be a positive integer'),
        body('company_id')
            .optional()
            .isInt().withMessage('Company Id must be a valid integer'),
        body('area_id')
            .optional()
            .isInt().withMessage('Area id must be a valid integer'),
    ]
}

const deleteLocationValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Location ID is required')
            .isInt({ gt: 0 }).withMessage('Location ID must be a positive integer'),
    ];
};


module.exports = { createLocationValidationRules, deleteLocationValidationRules }