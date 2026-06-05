const express = require('express');
const router = express.Router();

let title = 'Event Type';

const { protect, checkPermission } = require('../../middleware/authMiddleware');
const validator = require('../../middleware/validator');

const {
    createEventType,
    getEventTypes,
    getEventType,
    updateEventType,
    deleteEventType
} = require('../../controllers/event/eventTypeController');

const {
    createEventTypeValidationRules,
    updateEventTypeValidationRules,
    deleteEventTypeValidationRules
} = require('../../dtos/event/eventTypeDto');


// CREATE
router
    .route('/')
    .post(
        protect,
        checkPermission(['manage-event-types']),
        createEventTypeValidationRules(title),
        validator,
        createEventType
    );

// READ ALL
router
    .route('/')
    .get(protect, checkPermission(['view-event-types']), getEventTypes);

// READ SINGLE
router
    .route('/:id')
    .get(
        protect,
        checkPermission(['view-event-types']),
        getEventType
    );

// UPDATE
router
    .route('/:id')
    .patch(
        protect,
        checkPermission(['manage-event-types']),
        updateEventTypeValidationRules(title),
        validator,
        updateEventType
    );

// DELETE
router
    .route('/:id/delete')
    .delete(
        protect,
        checkPermission(['manage-event-types']),
        deleteEventTypeValidationRules(title),
        validator,
        deleteEventType
    );

module.exports = router;
