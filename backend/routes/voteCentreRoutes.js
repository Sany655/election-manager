const express = require('express');
const router = express.Router();
const {
    getVoteCentres,
    createVoteCentre,
    updateVoteCentre,
    deleteVoteCentre
} = require('../controllers/voteCentreController');

const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, checkPermission(['view-vote-centres']), getVoteCentres)
    .post(protect, checkPermission(['add-vote-centres']), createVoteCentre);

router.route('/:id')
    .put(protect, checkPermission(['edit-vote-centres']), updateVoteCentre)
    .delete(protect, checkPermission(['delete-vote-centres']), deleteVoteCentre);

module.exports = router;
