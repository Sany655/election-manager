const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
    getSessionStatus,
    sendMessage,
    sendBulkMessage,
    logout
} = require('../../controllers/message/whatsappController');

// All routes are protected
router.use(protect);

// Session Management (Managed via ENV session name)
// This endpoint checks status, auto-starts if needed, and returns QR if ready.
router.get('/session/status', protect, getSessionStatus);

// Messaging
router.post('/send', protect, sendMessage);
router.post('/send-bulk', protect, sendBulkMessage);
router.post('/logout', protect, logout);

module.exports = router;
