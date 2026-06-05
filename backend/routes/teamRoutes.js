const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createTeam, deleteTeamPermanently, editTeam, getTeams } = require('../controllers/teamController');
const { createTeamValidationRules, deleteTeamValidationRules } = require('../dtos/teamDto');


router.route('/').post(protect, authorize('admin', 'super-admin'), createTeamValidationRules(), validator, createTeam);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'), deleteTeamValidationRules(), validator, deleteTeamPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editTeam);
router.route('/').get(protect, getTeams);

module.exports = router;
