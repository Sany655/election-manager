const express = require('express');
const router = express.Router();
const {
    getWards,
    createWard,
    updateWard,
    deleteWard
} = require('../controllers/wardController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(getWards)
    .post(protect, checkPermission('manage-wards'), createWard);

router.route('/:id')
    .patch(protect, checkPermission('manage-wards'), updateWard)
    .delete(protect, checkPermission('manage-wards'), deleteWard);

module.exports = router;
