const express = require('express');
const router = express.Router();
const pushNotificationController = require('../../controllers/pushNotificationController');
const { checkPermission } = require('../../middleware/authMiddleware');

router.post('/', checkPermission('manage-push-notifications'), pushNotificationController.sendPushNotification);

module.exports = router;
