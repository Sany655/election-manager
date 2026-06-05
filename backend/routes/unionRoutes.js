const express = require('express');
const router = express.Router();
const {
    getUnions,
    createUnion,
    updateUnion,
    deleteUnion
} = require('../controllers/unionController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(getUnions)
    .post(protect, checkPermission('manage-unions'), createUnion);

router.route('/:id')
    .patch(protect, checkPermission('manage-unions'), updateUnion)
    .delete(protect, checkPermission('manage-unions'), deleteUnion);

module.exports = router;
