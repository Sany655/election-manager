const express = require('express');
const router = express.Router();

const { protect, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createTask, deleteTaskPermanently, editTask, getAllTasks, updateTaskStatus } = require('../controllers/taskController');
const { createTaskValidationRules, deleteTaskValidationRules } = require('../dtos/taskDto');


router.route('/').post(protect, checkPermission(['add-tasks']), validator, createTask);
router.route('/:id/delete').delete(protect, checkPermission(['delete-tasks']), validator, deleteTaskPermanently);
router.route('/:id').patch(protect, checkPermission(['edit-tasks']), editTask);
router.route('/:id/status').patch(protect, checkPermission(['edit-tasks']), updateTaskStatus);
router.route('/').get(protect, checkPermission(['view-tasks']), getAllTasks);

module.exports = router;
