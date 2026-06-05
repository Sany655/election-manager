const express = require('express');
const router = express.Router();

const { protect, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createTeam, assignTeamMember, getVolunteerTeams, deleteTeam, updateTeam, removeTeamMember } = require('../controllers/volunteerTeamController');
const { createTeamValidationRules } = require('../dtos/teamDto');

router.route('/').post(protect, checkPermission(['add-teams']), createTeamValidationRules(), validator, createTeam);
router.route('/assign').post(protect, checkPermission(['edit-teams']), assignTeamMember);
router.route('/remove-member').post(protect, checkPermission(['edit-teams']), removeTeamMember);
router.route('/:id/delete').delete(protect, checkPermission(['delete-teams']), deleteTeam);
router.route('/:id').patch(protect, checkPermission(['edit-teams']), updateTeam);
router.route('/').get(protect, checkPermission(['view-teams']), getVolunteerTeams);
// router.route('/').get(getVolunteerTeams);

module.exports = router;
