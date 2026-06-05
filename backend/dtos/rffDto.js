const { body, param } = require('express-validator');

const createRffValidationRules = () => {
    return [
        body('rff_point_name').trim().escape().notEmpty().withMessage('Rff Name is required'),
        body('territory_id')
            .notEmpty().withMessage('Territory ID is required')
            .bail()
            .toInt()
            .isInt({ gt: 0 }).withMessage('Territory ID must be a positive integer'),
        body('sap_code')
            .notEmpty().withMessage('SAP Code ID  required')
    ]
}

const deleteRffValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Rff ID is required')
            .isInt({ gt: 0 }).withMessage('Rff ID must be a positive integer'),
    ];
};


module.exports = { createRffValidationRules, deleteRffValidationRules }