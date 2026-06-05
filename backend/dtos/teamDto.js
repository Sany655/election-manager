const { body, param } = require('express-validator');

const createTeamValidationRules = () => {
    return [
        body('team_name').trim().escape().notEmpty().withMessage('Team Name is required'),
    ]
}

const deleteTeamValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Team ID is required')
            .isInt({ gt: 0 }).withMessage('Team ID must be a positive integer'),
    ];
};


module.exports = { createTeamValidationRules, deleteTeamValidationRules }