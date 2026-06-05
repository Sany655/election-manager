const express = require('express');
const router = express.Router();

let title = 'Event Target Group';

const { protect, checkPermission } = require('../../middleware/authMiddleware');
const validator = require('../../middleware/validator');

const {
    getEventTargetGroups,
    deleteEventTargetGroup,
    updateEventTargetGroup,
    createEventTargetGroup
} = require('../../controllers/event/eventTargetGroupController');


const {
    createEventTargetGroupValidationRules,
    updateEventTargetGroupValidationRules,
    deleteEventTargetGroupValidationRules
} = require('../../dtos/event/eventTargetGroupRoutes');
const { getEventTypes } = require('../../controllers/event/eventTypeController');


// CREATE
router
    .route('/')
    .post(
        protect,
        checkPermission(['manage-target-groups']),
        createEventTargetGroupValidationRules(title),
        validator,
        createEventTargetGroup
    );

// READ ALL
router
    .route('/')
    .get(protect, checkPermission(['view-target-groups']), getEventTargetGroups);

// READ SINGLE
router
    .route('/:id')
    .get(
        protect,
        checkPermission(['view-target-groups']),
        getEventTypes
    );

// UPDATE
router
    .route('/:id')
    .patch(
        protect,
        checkPermission(['manage-target-groups']),
        updateEventTargetGroupValidationRules(title),
        validator,
        updateEventTargetGroup
    );

// DELETE
router
    .route('/:id/delete')
    .delete(
        protect,
        checkPermission(['manage-target-groups']),
        deleteEventTargetGroupValidationRules(title),
        validator,
        deleteEventTargetGroup
    );

module.exports = router;
