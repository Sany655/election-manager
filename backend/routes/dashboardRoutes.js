const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/authMiddleware');
const { getDashboardStats, getVolunteerStats } = require('../controllers/dashboardController');

router.get('/stats', protect, checkPermission(['view-dashboard']), getDashboardStats);
router.get('/volunteer-stats', protect, checkPermission(['view-dashboard']), getVolunteerStats);

module.exports = router;
