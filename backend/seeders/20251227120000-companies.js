'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM companies LIMIT 1");
        if (existing.length > 0) {
            return;
        }

        await queryInterface.bulkInsert('companies', [
            {
                company_name: 'SEDP HQ',
                address: 'Dhaka, Bangladesh',
                metadata: JSON.stringify({ type: 'Government Project' }),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('companies', null, {});
    }
};
