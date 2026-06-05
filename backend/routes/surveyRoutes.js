const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Retrieve public survey (No auth needed)
router.get('/public/:uniqueId', surveyController.getPublicSurvey);
router.post('/public/:uniqueId/submit', surveyController.submitResponse);

// Analytics - likely private?
router.get('/:uniqueId/analytics', protect, checkPermission(['view-surveys']), surveyController.getSurveyAnalytics);

// Protected Routes
router.post('/generate', protect, checkPermission(['create-surveys', 'view-questionaire']), surveyController.generateSurvey);
router.post('/', protect, checkPermission(['create-surveys']), surveyController.createSurvey);
router.get('/', protect, checkPermission(['view-surveys']), surveyController.getUserSurveys);
router.get('/:uniqueId', protect, checkPermission(['view-surveys']), surveyController.getSurveyDetails);
router.delete('/:uniqueId', protect, checkPermission(['create-surveys']), surveyController.deleteSurvey);
router.put('/:uniqueId', protect, checkPermission(['create-surveys']), surveyController.updateSurvey);
router.put('/:id', protect, checkPermission(['create-surveys']), surveyController.updateSurvey);
router.delete('/:id', protect, checkPermission(['create-surveys']), surveyController.deleteSurvey);

module.exports = router;
