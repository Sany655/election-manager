'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM attendance_policies LIMIT 1");
        if (existing.length > 0) {
            return;
        }

        await queryInterface.bulkInsert('attendance_policies', [
            {
                name: 'Standard 9-5',
                working_days: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                off_days: JSON.stringify(['Saturday', 'Sunday']),
                work_start_time: '09:00:00',
                work_end_time: '17:00:00',
                late_grace_period: 15,
                overtime_threshold: 60,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('attendance_policies', null, {});
    }
};
