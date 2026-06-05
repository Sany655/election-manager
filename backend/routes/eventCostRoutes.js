const express = require('express');
const router = express.Router();

const { optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');

const { eventCostValidationRules } = require('../dtos/eventCostDto');
const { getEventCostSummary } = require('../controllers/eventCostController');

router.get(
  '/:eventId',
  optionalAuth,
  eventCostValidationRules(),
  validator,
  getEventCostSummary
);

module.exports = router;