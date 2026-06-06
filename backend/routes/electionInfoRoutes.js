const express = require('express');
const router = express.Router();
const electionInfoController = require('../controllers/electionInfoController');
const { checkPermission } = require('../middlewares/authMiddleware');

router.get('/', electionInfoController.getElectionInfo);
router.post('/', checkPermission('manage-election-info'), electionInfoController.updateElectionInfo);

module.exports = router;
