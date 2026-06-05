const express = require('express');
const router = express.Router();
const {
    getDivisions,
    createDivision,
    updateDivision,
    deleteDivision
} = require('../controllers/divisionController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
    .get(getDivisions)
    .post(protect, checkPermission('manage-divisions'), createDivision);

router.route('/:id')
    .patch(protect, checkPermission('manage-divisions'), updateDivision)
    .delete(protect, checkPermission('manage-divisions'), deleteDivision);

module.exports = router;
