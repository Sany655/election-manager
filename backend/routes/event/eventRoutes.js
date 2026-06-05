const express = require('express');
const router = express.Router();

let title = 'Event';

const { protect, authorize, checkPermission } = require('../../middleware/authMiddleware');
const validator = require('../../middleware/validator');
const { createEvent, getEvents, deleteEvent, updateEvent, assignTeam, removeTeam } = require('../../controllers/event/eventController');
const { createEventValidationRules } = require('../../dtos/event/eventDto');

router.route('/').post(protect, checkPermission(['add-events']), createEventValidationRules(title), validator, createEvent);
router.route('/assign-team').post(protect, checkPermission(['edit-events']), assignTeam);
router.route('/:id/teams/:team_id').delete(protect, checkPermission(['edit-events']), removeTeam);
router.route('/:id/delete').delete(protect, checkPermission(['delete-events']), deleteEvent);
router.route('/:id').patch(protect, checkPermission(['edit-events']), updateEvent);
router.route('/').get(getEvents);

module.exports = router;
