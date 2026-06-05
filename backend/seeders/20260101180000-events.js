'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // Fetch related IDs (Event Types, Target Groups, Organizers) for realistic data
        // Assuming ids 1 exists from previous seeders or are auto-incremented

        // Check if events exist to avoid duplicates
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM Events LIMIT 1");
        if (existing.length > 0) {
            return;
        }

        await queryInterface.bulkInsert('Events', [
            {
                name: 'Grand Rally 2026',
                objective: 'Mobilize voters for the upcoming election',
                type_id: 1, // Rally
                status: 0, // Pending
                visibility: 1, // Public
                target_group_id: 1, // General Public (assuming id 1 exists)
                created_by: 1,
                organized_by: 1,
                capacity: 5000,
                est_budget: 50000.00,
                est_spending: 0.00,
                location: 'Central Park',
                division_id: 1,
                district_id: 1,
                upazilla_id: 1,
                union_id: 1,
                ward: 1,
                expected_start_datetime: '2026-02-15 10:00:00',
                expected_end_datetime: '2026-02-15 14:00:00',
                createdAt: now,
                updatedAt: now,
            },
            {
                name: 'Youth Leadership Workshop',
                objective: 'Train young volunteers on campaign strategies',
                type_id: 7, // Workshop
                status: 1, // In-Progress
                visibility: 0, // Internal
                target_group_id: 2, // Youth (assuming id 2 exists)
                created_by: 1,
                organized_by: 1,
                capacity: 50,
                est_budget: 2000.00,
                est_spending: 500.00,
                location: 'Community Center',
                division_id: 1,
                district_id: 1,
                upazilla_id: 1,
                union_id: 1,
                ward: 1,
                expected_start_datetime: '2026-01-20 09:00:00',
                expected_end_datetime: '2026-01-20 17:00:00',
                createdAt: now,
                updatedAt: now,
            },
            {
                name: 'Door to Door Campaign - Phase 1',
                objective: 'Direct voter engagement in Ward 5',
                type_id: 3, // Door to Door
                status: 0,
                visibility: 0,
                target_group_id: 1,
                created_by: 1,
                organized_by: 1,
                capacity: 100,
                est_budget: 1000.00,
                est_spending: 0.00,
                location: 'Ward 5',
                division_id: 1,
                district_id: 1,
                upazilla_id: 1,
                union_id: 1,
                ward: 5,
                expected_start_datetime: '2026-01-25 08:00:00',
                expected_end_datetime: '2026-01-25 18:00:00',
                createdAt: now,
                updatedAt: now,
            },
            {
                name: 'Press Conference: Manifesto Launch',
                objective: 'Announce the official election manifesto',
                type_id: 6, // Press Conference
                status: 0,
                visibility: 1,
                target_group_id: 3, // Media
                created_by: 1,
                organized_by: 1,
                capacity: 200,
                est_budget: 5000.00,
                est_spending: 0.00,
                location: 'Press Club',
                division_id: 1,
                district_id: 1,
                upazilla_id: 1,
                union_id: 1,
                ward: 1,
                expected_start_datetime: '2026-02-01 11:00:00',
                expected_end_datetime: '2026-02-01 13:00:00',
                createdAt: now,
                updatedAt: now,
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Events', null, {});
    }
};
