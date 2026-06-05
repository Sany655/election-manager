// add validation rules for task creation and editing in the future

const { body, param } = require('express-validator');

// Example validation rules for creating a task
const createTaskValidationRules = () => {
    return [
        body('title').trim().escape().notEmpty().withMessage('Title is required'),
        // body('description').optional().trim().escape(),
        // body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
        // body('duetime').optional().isISO8601().withMessage('Due time must be a valid date'),
        // body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be pending, in-progress, or completed'),
    ];
}

const deleteTaskValidationRules = () => {
    return [
        param('id')
            .notEmpty().withMessage('Task ID is required')
            .isInt({ gt: 0 }).withMessage('Task ID must be a positive integer'),
    ];
};


module.exports = {
    createTaskValidationRules,
    deleteTaskValidationRules
};