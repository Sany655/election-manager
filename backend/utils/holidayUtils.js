const db = require("../models/index");
const { Holiday, User, UserHoliday } = db;
const { Op } = require('sequelize');

const getUserHolidaysForDateRange = async (userId, startDate, endDate) => {
    // Get user with location and area info
    const user = await User.findByPk(userId, {
        attributes: ['id', 'location_id', 'area_id']
    });
    
    if (!user) return [];
    
    const dateFilter = {
        [Op.between]: [startDate, endDate]
    };
    
    const whereClause = {
        is_active: true,
        date: dateFilter
    };
    
    // Get all applicable holidays
    const holidayQueries = [
        // Global holidays
        Holiday.findAll({
            where: { ...whereClause, scope: 'global' },
            attributes: ['date', 'name', 'type']
        })
    ];
    
    // Location-specific holidays
    if (user.location_id) {
        holidayQueries.push(
            Holiday.findAll({
                where: {
                    ...whereClause,
                    scope: 'location',
                    location_id: user.location_id
                },
                attributes: ['date', 'name', 'type']
            })
        );
    }
    
    // Area-specific holidays
    if (user.area_id) {
        holidayQueries.push(
            Holiday.findAll({
                where: {
                    ...whereClause,
                    scope: 'area',
                    area_id: user.area_id
                },
                attributes: ['date', 'name', 'type']
            })
        );
    }
    
    // User-specific holidays
    holidayQueries.push(
        Holiday.findAll({
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
            attributes: ['date', 'name', 'type']
        })
    );
    
    const results = await Promise.all(holidayQueries);
    const allHolidays = results.flat();
    
    // Remove duplicates based on date and return sorted
    const uniqueHolidays = allHolidays.filter((holiday, index, self) =>
        index === self.findIndex(h => h.date === holiday.date)
    );
    
    return uniqueHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getHolidayDatesForUser = async (userId, startDate, endDate) => {
    const holidays = await getUserHolidaysForDateRange(userId, startDate, endDate);
    return holidays.map(h => h.date);
};

module.exports = {
    getUserHolidaysForDateRange,
    getHolidayDatesForUser
};