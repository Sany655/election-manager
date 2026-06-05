const express = require('express');
const router = express.Router();

const validator = require('../middleware/validator');
const {
    createVoter,
    getAllVoters,
    getVoterById,
    updateVoter,
    deleteVoter,
    getVoterStats
} = require('../controllers/voterController');
const {
    createVoterValidationRules,
    updateVoterValidationRules,
    deleteVoterValidationRules,
    getVoterValidationRules
} = require('../dtos/voterDto');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Stats route
router.route('/stats').get(protect, checkPermission(['view-voters']), getVoterStats);

// Main CRUD routes
router.route('/')
    .post(protect, checkPermission(['add-voters']), createVoterValidationRules(), validator, createVoter)
    .get(protect, checkPermission(['view-voters']), getAllVoters);

router.route('/:id')
    .get(protect, checkPermission(['view-voters']), getVoterValidationRules(), validator, getVoterById)
    .patch(protect, checkPermission(['edit-voters']), updateVoterValidationRules(), validator, updateVoter)
    .delete(protect, checkPermission(['delete-voters']), deleteVoterValidationRules(), validator, deleteVoter);

module.exports = router;
