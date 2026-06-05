const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createTerritoryValidationRules, deleteTerritoryValidationRules } = require('../dtos/terrirtoryDto');
const {  editTerritory, getTerritotries, deleteTerritoryPermanently, createTerritory } = require('../controllers/territoryController');


router.route('/').post(protect, authorize('admin', 'super-admin'), createTerritoryValidationRules(), validator, createTerritory);
router.route('/:id/delete').delete(protect, authorize('admin', 'super-admin'), deleteTerritoryValidationRules(), validator, deleteTerritoryPermanently);
router.route('/:id').patch(protect, authorize('admin', 'super-admin'), editTerritory);
router.route('/').get(protect, getTerritotries);

module.exports = router;
