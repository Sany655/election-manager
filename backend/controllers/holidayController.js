const db = require("../models/index");
const { Holiday, UserHoliday, User, Location, Area } = db;
const { Op } = require('sequelize');
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require('../utils/errorresponse');


//@route    POST /api/holidays
//@desc     Create a new holiday
//@access   Protected (Admin)
const createHoliday = asyncHandler(async (req, res, next) => {
    const {
        name,
        description,
        date,
        type,
        scope,
        location_id,
        area_id,
        is_recurring,
        user_ids
    } = req.body;
    
    // Validation based on scope
    if (scope === 'location' && !location_id) {
        return next(new ErrorResponse('Location ID is required for location-specific holidays', 400));
    }
    
    if (scope === 'area' && !area_id) {
        return next(new ErrorResponse('Area ID is required for area-specific holidays', 400));
    }
    
    if (scope === 'individual' && (!user_ids || user_ids.length === 0)) {
        return next(new ErrorResponse('User IDs are required for individual user holidays', 400));
    }
    
    // Check for existing holidays to prevent duplicates
    const existingHolidayConditions = {
        date: date,
        [Op.or]: [
            // Same name
            { name: name },
            // Same scope conditions
            ...(scope === 'company' ? [{ scope: 'company' }] : []),
            ...(scope === 'location' ? [{ scope: 'location', location_id: location_id }] : []),
            ...(scope === 'area' ? [{ scope: 'area', area_id: area_id }] : [])
        ]
    };
    
    const existingHoliday = await Holiday.findOne({
        where: existingHolidayConditions
    });
    
    if (existingHoliday) {
        return next(new ErrorResponse(
            `A holiday already exists on ${date} with similar scope. Holiday: "${existingHoliday.name}"`, 
            409
        ));
    }
    
    // For individual scope, check if users already have holidays on this date
    if (scope === 'individual' && user_ids && user_ids.length > 0) {
        const existingUserHolidays = await UserHoliday.findAll({
            include: [{
                model: Holiday,
                where: { date: date }
            }],
            where: {
                user_id: {
                    [Op.in]: user_ids
                }
            }
        });
        
        if (existingUserHolidays.length > 0) {
            const conflictingUsers = existingUserHolidays.map(uh => uh.user_id);
            return next(new ErrorResponse(
                `Some users already have holidays on ${date}. Conflicting user IDs: ${conflictingUsers.join(', ')}`, 
                409
            ));
        }
    }
    
    // Create the holiday
    const holiday = await Holiday.create({
        name,
        description,
        date,
        type,
        scope,
        location_id: scope === 'location' ? location_id : null,
        area_id: scope === 'area' ? area_id : null,
        is_recurring,
        created_by: req.user.id
    });
    
    // If individual scope, assign to specific users
    if (scope === 'individual' && user_ids && user_ids.length > 0) {
        const userAssignments = user_ids.map(user_id => ({
            holiday_id: holiday.id,
            user_id: user_id
        }));
        await UserHoliday.bulkCreate(userAssignments);
    }
    
    res.status(201).json({
        success: true,
        msg: 'Holiday created successfully',
        data: holiday,
    });
});

//@route    POST /api/holidays/assign-bulk
//@desc     Assign holidays to users by location/area
//@access   Protected (Admin)
const assignHolidaysBulk = asyncHandler(async (req, res, next) => {
    const { holiday_ids, location_id, area_id, user_ids } = req.body;
    
    if (!Array.isArray(holiday_ids) || holiday_ids.length === 0) {
        return next(new ErrorResponse('No holidays provided for assignment', 400));
    }
    
    let targetUsers = [];
    
    // Get users based on criteria
    if (user_ids && user_ids.length > 0) {
        targetUsers = user_ids;
    } else if (location_id) {
        const users = await User.findAll({
            where: { location_id },
            attributes: ['id']
        });
        targetUsers = users.map(u => u.id);
    } else if (area_id) {
        const users = await User.findAll({
            where: { area_id },
            attributes: ['id']
        });
        targetUsers = users.map(u => u.id);
    } else {
        return next(new ErrorResponse('Must provide either user_ids, location_id, or area_id', 400));
    }
    
    if (targetUsers.length === 0) {
        return next(new ErrorResponse('No users found for assignment', 400));
    }
    
    // Check existing assignments
    const existingAssignments = await UserHoliday.findAll({
        where: {
            user_id: { [Op.in]: targetUsers },
            holiday_id: { [Op.in]: holiday_ids }
        }
    });
    
    const existingPairs = existingAssignments.map(assignment => 
        `${assignment.user_id}-${assignment.holiday_id}`
    );
    
    // Create new assignments
    const newAssignments = [];
    targetUsers.forEach(user_id => {
        holiday_ids.forEach(holiday_id => {
            const pair = `${user_id}-${holiday_id}`;
            if (!existingPairs.includes(pair)) {
                newAssignments.push({
                    user_id,
                    holiday_id
                });
            }
        });
    });
    
    if (newAssignments.length === 0) {
        return next(new ErrorResponse('All holidays already assigned to all users!', 400));
    }
    
    await UserHoliday.bulkCreate(newAssignments);
    
    res.status(200).json({
        success: true,
        message: `${newAssignments.length} holiday assignments created successfully!`,
        newAssignments: newAssignments.length,
        skipped: (targetUsers.length * holiday_ids.length) - newAssignments.length
    });
});

//@route    GET /api/holidays/user/:userId
//@desc     Get holidays for a specific user
//@access   Protected
const getUserHolidays = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { year, month } = req.query;
    
    // Get user with location and area info
    const user = await User.findByPk(userId, {
        attributes: ['id', 'location_id', 'area_id']
    });
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }
    
    let dateFilter = {};
    if (year) {
        if (month) {
            const startDate = `${year}-${month.padStart(2, '0')}-01`;
            const endDate = new Date(year, month, 0).toISOString().split('T')[0];
            dateFilter = {
                [Op.between]: [startDate, endDate]
            };
        } else {
            dateFilter = {
                [Op.between]: [`${year}-01-01`, `${year}-12-31`]
            };
        }
    }
    
    const whereClause = {
        is_active: true,
        ...(Object.keys(dateFilter).length && { date: dateFilter })
    };
    
    // Get global holidays
    const globalHolidays = await Holiday.findAll({
        where: {
            ...whereClause,
            scope: 'global'
        },
        order: [['date', 'ASC']]
    });
    
    // Get location-specific holidays
    const locationHolidays = user.location_id ? await Holiday.findAll({
        where: {
            ...whereClause,
            scope: 'location',
            location_id: user.location_id
        },
        order: [['date', 'ASC']]
    }) : [];
    
    // Get area-specific holidays
    const areaHolidays = user.area_id ? await Holiday.findAll({
        where: {
            ...whereClause,
            scope: 'area',
            area_id: user.area_id
        },
        order: [['date', 'ASC']]
    }) : [];
    
    // Get user-specific holidays
    const userSpecificHolidays = await Holiday.findAll({
        include: [
            {
                model: User,
                as: 'users',
                where: { id: userId },
                through: { 
                    where: { is_applicable: true },
                    attributes: []
                }
            }
        ],
        where: {
            ...whereClause,
            scope: 'user_specific'
        },
        order: [['date', 'ASC']]
    });
    
    // Combine all holidays and remove duplicates
    const allHolidays = [
        ...globalHolidays.map(h => ({ ...h.toJSON(), source: 'global' })),
        ...locationHolidays.map(h => ({ ...h.toJSON(), source: 'location' })),
        ...areaHolidays.map(h => ({ ...h.toJSON(), source: 'area' })),
        ...userSpecificHolidays.map(h => ({ ...h.toJSON(), source: 'user_specific' }))
    ];
    
    // Remove duplicates based on date
    const uniqueHolidays = allHolidays.filter((holiday, index, self) =>
        index === self.findIndex(h => h.date === holiday.date)
    );
    
    res.status(200).json({
        success: true,
        count: uniqueHolidays.length,
        data: uniqueHolidays.sort((a, b) => new Date(a.date) - new Date(b.date))
    });
});

//@route    GET /api/holidays
//@desc     Get holidays 
//@access   Protected
const getAllHolidays = asyncHandler(async (req, res, next) => {
  
    // Get user-specific holidays
    const allHolidays = await Holiday.findAll({

        order: [['date', 'ASC']]
    });
    
 
    // Remove duplicates based on date
    const uniqueHolidays = allHolidays.filter((holiday, index, self) =>
        index === self.findIndex(h => h.date === holiday.date)
    );
    
    res.status(200).json({
        success: true,
        count: uniqueHolidays.length,
        data: uniqueHolidays.sort((a, b) => new Date(a.date) - new Date(b.date))
    });
});

//@route    /api/holidays/:id/delete
//@desc     DELETE: delete a holiday Permanently
//@access   protected by admin
const deleteHolidayPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
        return next(new ErrorResponse('No holiday Found to Delete!', 404));
    }

    await holiday.destroy();

    return res.status(200).json({
        success: true,
        msg: `${holiday.name} deleted successfully!`,
    });
})


module.exports = {
    createHoliday,
    assignHolidaysBulk,
    getUserHolidays,
    getAllHolidays,
    deleteHolidayPermanently
};