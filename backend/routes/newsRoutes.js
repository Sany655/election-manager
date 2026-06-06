const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { checkPermission } = require('../middleware/authMiddleware');

router.get('/', newsController.getAllNews);
router.post('/', checkPermission('manage-news'), newsController.createNews);
router.put('/:id', checkPermission('manage-news'), newsController.updateNews);
router.delete('/:id', checkPermission('manage-news'), newsController.deleteNews);

module.exports = router;
