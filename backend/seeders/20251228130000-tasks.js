'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Check if tasks already exist
        const [existingTasks] = await queryInterface.sequelize.query("SELECT id FROM Tasks LIMIT 1");
        if (existingTasks.length > 0) {
            return;
        }

        const tasks = [
            {
                title: 'Complete Voter Registration Analysis',
                description: 'Analyze the recent voter registration data and identify gaps in coverage.',
                priority: 1, // High priority
                type: 'Analysis',
                duetime: new Date(new Date().setDate(new Date().getDate() + 7)), // Due in 7 days
                status: 'Pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Prepare Campaign Materials',
                description: 'Design and print flyers for the upcoming winter donation drive.',
                priority: 2, // Medium priority
                type: 'Content Creation',
                duetime: new Date(new Date().setDate(new Date().getDate() + 3)), // Due in 3 days
                status: 'In Progress',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Volunteer Orientation Review',
                description: 'Review the feedback from the last volunteer orientation session.',
                priority: 3, // Low priority
                type: 'Review',
                duetime: new Date(new Date().setDate(new Date().getDate() + 14)), // Due in 14 days
                status: 'Completed',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Update Website Survey Section',
                description: 'Add the new survey forms to the website for public feedback.',
                priority: 1,
                type: 'Development',
                duetime: new Date(new Date().setDate(new Date().getDate() + 5)),
                status: 'Pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Logistics Planning for Event',
                description: 'Coordinate with transport teams for the upcoming fundraiser event.',
                priority: 2,
                type: 'Logistics',
                duetime: new Date(new Date().setDate(new Date().getDate() + 10)),
                status: 'Pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];

        await queryInterface.bulkInsert('Tasks', tasks, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Tasks', null, {});
    }
};
