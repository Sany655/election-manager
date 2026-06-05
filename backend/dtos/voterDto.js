const { body, param } = require('express-validator');

// Validation rules for creating a voter
const createVoterValidationRules = () => {
    return [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        
        body('age')
            .notEmpty().withMessage('Age is required')
            .isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
        
        body('gender')
            .notEmpty().withMessage('Gender is required')
            .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
        
        body('nid')
            .trim()
            .notEmpty().withMessage('NID is required')
            .isLength({ min: 10, max: 20 }).withMessage('NID must be between 10 and 20 characters'),
        
        body('phone')
            .optional()
            .trim()
            .matches(/^[0-9+\-\s()]*$/).withMessage('Phone number format is invalid'),
        
        body('profession')
            .optional()
            .trim(),
        
        body('division_id')
            .notEmpty().withMessage('Division ID is required')
            .isInt().withMessage('Division ID must be an integer'),
        
        body('district_id')
            .notEmpty().withMessage('District ID is required')
            .isInt().withMessage('District ID must be an integer'),
        
        body('upazilla_id')
            .notEmpty().withMessage('Upazilla ID is required')
            .isInt().withMessage('Upazilla ID must be an integer'),
        
        body('union_id')
            .notEmpty().withMessage('Union ID is required')
            .isInt().withMessage('Union ID must be an integer'),
        
        body('ward')
            .notEmpty().withMessage('Ward is required')
            .trim(),
        
        body('voter_center')
            .notEmpty().withMessage('Voter center is required')
            .trim()
    ];
};

// Validation rules for updating a voter
const updateVoterValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Voter ID is required')
            .isInt({ gt: 0 }).withMessage('Voter ID must be a positive integer'),
        
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        
        body('age')
            .optional()
            .isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
        
        body('gender')
            .optional()
            .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
        
        body('phone')
            .optional()
            .trim()
            .matches(/^[0-9+\-\s()]*$/).withMessage('Phone number format is invalid'),
        
        body('profession')
            .optional()
            .trim()
    ];
};

// Validation rules for deleting a voter
const deleteVoterValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Voter ID is required')
            .isInt({ gt: 0 }).withMessage('Voter ID must be a positive integer')
    ];
};

// Validation rules for getting a single voter
const getVoterValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Voter ID is required')
            .isInt({ gt: 0 }).withMessage('Voter ID must be a positive integer')
    ];
};

module.exports = {
    createVoterValidationRules,
    updateVoterValidationRules,
    deleteVoterValidationRules,
    getVoterValidationRules
};
