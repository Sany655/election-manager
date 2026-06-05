'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Check if campaigns already exist
        const [existingCampaigns] = await queryInterface.sequelize.query("SELECT id FROM campaigns LIMIT 1");
        if (existingCampaigns.length > 0) {
            return;
        }

        // Get a user to assign as the creator
        const [users] = await queryInterface.sequelize.query("SELECT id FROM users LIMIT 1");
        const userId = users.length > 0 ? users[0].id : null;

        if (!userId) {
            console.warn('No users found to assign to campaigns. Skipping campaign seeding.');
            return;
        }

        const campaigns = [
            {
                title: 'Winter Donation Drive 2025',
                description: 'A campaign to collect warm clothes and blankets for the needy during winter.',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2026-02-28'),
                user_id: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Education for All',
                description: 'Fundraising and awareness campaign to support primary education in rural areas.',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-12-31'),
                user_id: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Clean Water Initiative',
                description: 'Project to install tube wells and provide clean drinking water.',
                startDate: new Date('2025-06-01'),
                endDate: new Date('2025-09-30'),
                user_id: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('campaigns', campaigns, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('campaigns', null, {});
    }
};
