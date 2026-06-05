const express = require('express');
const router = express.Router();

const { optionalAuth } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');

const { eventCostValidationRules } = require('../dtos/eventCostDto');
const { getEventGrandTotal } = require('../controllers/eventGrandTotalController');

router.get(
  '/:eventId',
  optionalAuth,
  eventCostValidationRules(),
  validator,
  getEventGrandTotal
);

module.exports = router;