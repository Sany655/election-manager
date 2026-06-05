const { body, param } = require('express-validator');

const createVolunteerTeamValidationRules = () => {
    return [
        body('team_name').trim().escape().notEmpty().withMessage('Team Name is required'),
        body('type',).notEmpty().withMessage('Type is required')
            .trim(),
        body('leader_id',).notEmpty().withMessage('Leader Id is required')
            .trim()
            .isInt().withMessage('Company Id must be a valid integer'),
    ]
}

const deleteVolunteerTeamValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Team ID is required')
            .isInt({ gt: 0 }).withMessage('Team ID must be a positive integer'),
    ];
};


module.exports = { createVolunteerTeamValidationRules, deleteVolunteerTeamValidationRules }