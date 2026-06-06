'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM departments LIMIT 1");
        if (existing.length > 0) {
            return;
        }

        const [companies] = await queryInterface.sequelize.query("SELECT id FROM companies LIMIT 1");
        const companyId = companies.length ? companies[0].id : null;

        await queryInterface.bulkInsert('departments', [
            {
                name: 'Engineering',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'HR',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Administration',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('departments', null, {});
    }
};
