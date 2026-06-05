const express = require('express');
const router = express.Router();
const {
    getDistricts,
    createDistrict,
    updateDistrict,
    deleteDistrict
} = require('../controllers/districtController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(getDistricts)
    .post(protect, checkPermission('manage-districts'), createDistrict);

router.route('/:id')
    .patch(protect, checkPermission('manage-districts'), updateDistrict)
    .delete(protect, checkPermission('manage-districts'), deleteDistrict);

module.exports = router;
