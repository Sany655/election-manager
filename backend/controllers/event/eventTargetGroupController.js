const asyncHandler = require("../../middleware/asyncHandler");
const db = require('../../models/index');
const ErrorResponse = require("../../utils/errorresponse");
const { EventTargetGroup } = db;

let title = "Event Target Group";

/* ----------------------------------------------------
   CREATE EVENT TYPE
   POST /api/event-types
------------------------------------------------------*/
const createEventTargetGroup = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    // Check if exists
    const exists = await EventTargetGroup.findOne({ where: { name } });
    if (exists) {
        return next(new ErrorResponse(`${title} already exists`, 400));
    }

    const newItem = await EventTargetGroup.create({ name, description });

    return res.status(201).json({
        success: true,
        msg: `${title} created successfully!`,
        data: newItem
    });
});


/* ----------------------------------------------------
   GET ALL EVENT TYPES
   GET /api/event-types
------------------------------------------------------*/
const getEventTargetGroups = asyncHandler(async (req, res, next) => {
    const items = await EventTargetGroup.findAll({});

    return res.status(200).json({
        success: true,
        msg: `${title}s fetched successfully!`,
        data: items
    });
});


/* ----------------------------------------------------
   GET SINGLE EVENT TYPE
   GET /api/event-types/:id
------------------------------------------------------*/
const getEventTargetGroup = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const item = await EventTargetGroup.findByPk(id);

    if (!item) {
        return next(new ErrorResponse(`${title} not found`, 404));
    }

    return res.status(200).json({
        success: true,
        msg: `${title} fetched successfully!`,
        data: item
    });
});


/* ----------------------------------------------------
   UPDATE EVENT TYPE
   PATCH /api/event-types/:id
------------------------------------------------------*/
const updateEventTargetGroup = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { name, description } = req.body;

    const item = await EventTargetGroup.findByPk(id);
    if (!item) {
        return next(new ErrorResponse(`${title} not found`, 404));
    }

    // Check duplicate name
    if (name && name !== item.name) {
        const exists = await EventTargetGroup.findOne({ where: { name } });
        if (exists) {
            return next(new ErrorResponse(`${title} name already exists`, 400));
        }
    }

    await item.update({ name, description });

    return res.status(200).json({
        success: true,
        msg: `${title} updated successfully!`,
        data: item
    });
});


/* ----------------------------------------------------
   DELETE EVENT TYPE (Permanently)
   DELETE /api/event-types/:id
------------------------------------------------------*/
const deleteEventTargetGroup = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const item = await EventTargetGroup.findByPk(id);
    if (!item) {
        return next(new ErrorResponse(`${title} not found`, 404));
    }

    await item.destroy();

    return res.status(200).json({
        success: true,
        msg: `${title} deleted successfully!`
    });
});


module.exports = {
    createEventTargetGroup,
    getEventTargetGroups,
    getEventTargetGroup,
    updateEventTargetGroup,
    deleteEventTargetGroup
};
