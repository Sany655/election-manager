const express = require('express');
const router = express.Router();
const {
    getUpazillas,
    createUpazilla,
    updateUpazilla,
    deleteUpazilla
} = require('../controllers/upazillaController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(getUpazillas)
    .post(protect, checkPermission('manage-upazillas'), createUpazilla);

router.route('/:id')
    .patch(protect, checkPermission('manage-upazillas'), updateUpazilla)
    .delete(protect, checkPermission('manage-upazillas'), deleteUpazilla);

module.exports = router;
