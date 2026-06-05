const express = require('express');
const router = express.Router();

const { protect, authorize, optionalAuth, checkPermission } = require('../../middleware/authMiddleware');
const { sendEmail, sendSms, sendMessageToTeams } = require('../../controllers/message/messagingController');


router.route('/email').post(protect, sendEmail);
router.route('/sms').post(protect, sendSms);
router.route('/team').post(protect, sendMessageToTeams);

module.exports = router;
