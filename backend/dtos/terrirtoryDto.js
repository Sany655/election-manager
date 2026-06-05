const { body, param } = require('express-validator');

const createTerritoryValidationRules = () => {
    return [
        body('territory_name').trim().escape().notEmpty().withMessage('Territory Name is required'),
        body('area_id')
            .notEmpty().withMessage('Area ID is required')
            .bail()
            .toInt()
            .isInt({ gt: 0 }).withMessage('Area ID must be a positive integer'),
    ]
}

const deleteTerritoryValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Territory ID is required')
            .isInt({ gt: 0 }).withMessage('Territory ID must be a positive integer'),
    ];
};


module.exports = { createTerritoryValidationRules, deleteTerritoryValidationRules }