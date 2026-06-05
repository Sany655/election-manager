const asyncHandler = require("../../middleware/asyncHandler");
const db = require('../../models/index');
const ErrorResponse = require("../../utils/errorresponse");
const { Event } = db;

const title = 'Event';


// =============================
// CREATE EVENT
// =============================
const createEvent = asyncHandler(async (req, res, next) => {

    // Check if name already exists
    const isExist = await Event.findOne({ where: { name: req.body.name } });
    if (isExist) {
        return next(new ErrorResponse(`${title} already exists`, 400));
    }

    const newItem = await Event.create({ ...req.body });

    return res.status(201).json({
        success: true,
        msg: `${title} created successfully!`,
        data: newItem
    });
});


// =============================
// ASSIGN TEAM TO EVENT
// =============================
const assignTeam = asyncHandler(async (req, res, next) => {
    const { event_id, team_ids } = req.body;

    const event = await Event.findByPk(event_id);
    if (!event) {
        return next(new ErrorResponse(`Event not found!`, 404));
    }

    // if (!team_ids || team_ids.length === 0) {
    //     return next(new ErrorResponse(`Please provide team ids`, 400));
    // }

    // Add teams
    await event.setVolunteer_teams(team_ids);

    return res.status(200).json({
        success: true,
        msg: `Teams assigned successfully!`,
    });
});

// =============================
// REMOVE TEAM FROM EVENT
// =============================
const removeTeam = asyncHandler(async (req, res, next) => {
    const { event_id, team_id } = req.params;

    const event = await Event.findByPk(event_id);
    if (!event) {
        return next(new ErrorResponse(`Event not found!`, 404));
    }

    // Remove team
    await event.removeVolunteer_team(team_id);

    return res.status(200).json({
        success: true,
        msg: `Team removed successfully!`,
    });
});


// =============================
// GET ALL EVENTS
// =============================
const getEvents = asyncHandler(async (req, res, next) => {
    const events = await Event.findAll({
        include: [
            { model: db.Division, as: 'division', attributes: ['id', 'name'] },
            { model: db.District, as: 'district', attributes: ['id', 'name'] },
            { model: db.Upazilla, as: 'upazilla', attributes: ['id', 'name'] },
            { model: db.Union, as: 'union', attributes: ['id', 'name'] },
            { model: db.EventType, as: 'event_type', attributes: ['id', 'name'] },
            { model: db.Organizer, as: 'organizer', attributes: ['id', 'name'] },
            {
                model: db.VolunteerTeam,
                as: 'volunteer_teams',
                through: { attributes: [] },
                attributes: ['id', 'name']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
        success: true,
        msg: `${title}s fetched successfully!`,
        data: events
    });
});


// =============================
// GET SINGLE EVENT BY ID
// =============================
const getEventById = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const event = await Event.findByPk(id, {
        include: [
            {
                model: db.VolunteerTeam,
                as: 'volunteer_teams',
                through: { attributes: [] }
            }
        ]
    });

    if (!event) {
        return next(new ErrorResponse(`${title} not found!`, 404));
    }

    return res.status(200).json({
        success: true,
        msg: `${title} fetched successfully!`,
        data: event
    });
});


// =============================
// UPDATE EVENT
// =============================
const updateEvent = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const event = await Event.findByPk(id);

    if (!event) {
        return next(new ErrorResponse(`${title} not found to update!`, 404));
    }

    await event.update({ ...req.body });

    return res.status(200).json({
        success: true,
        msg: `${title} updated successfully!`,
        data: event
    });
});


// =============================
// DELETE EVENT
// =============================
const deleteEvent = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    const event = await Event.findByPk(id);

    if (!event) {
        return next(new ErrorResponse(`${title} not found to delete!`, 404));
    }

    await event.destroy();

    return res.status(200).json({
        success: true,
        msg: `${title} deleted successfully!`
    });
});


// =============================
module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    assignTeam,
    removeTeam
};
