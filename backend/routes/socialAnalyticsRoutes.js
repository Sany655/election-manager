const express = require('express');
const router = express.Router();
const socialAnalyticsController = require('../controllers/socialAnalyticsController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.post('/analyze', protect, checkPermission(['run-social-analytics']), socialAnalyticsController.analyzePost);
router.get('/', protect, checkPermission(['view-social-analytics']), socialAnalyticsController.getHistory);
router.get('/:id', protect, checkPermission(['view-social-analytics']), socialAnalyticsController.getAnalysisById);
router.delete('/:id', protect, checkPermission(['run-social-analytics']), socialAnalyticsController.deleteAnalysis);

module.exports = router;
