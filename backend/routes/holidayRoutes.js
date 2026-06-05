const express = require('express');
const {
    createHoliday,
    assignHolidaysBulk,
    getUserHolidays,
    getAllHolidays,
    deleteHolidayPermanently
} = require('../controllers/holidayController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .post(createHoliday);

router
    .route('/assign')
    .post(assignHolidaysBulk);

router
    .route('/user/:userId')
    .get(getUserHolidays);
router
    .route('/')
    .get(getAllHolidays);
router
    .route('/:id/delete')
    .delete(deleteHolidayPermanently);

module.exports = router;