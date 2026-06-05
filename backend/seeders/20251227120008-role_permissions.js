'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM role_permissions LIMIT 1");
        if (existing.length > 0) {
            return;
        }

        // Fetch dependencies
        const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'super-admin' LIMIT 1");
        const [permissions] = await queryInterface.sequelize.query("SELECT id FROM permissions");

        if (!roles.length || !permissions.length) {
            console.warn('Skipping role_permissions seeding due to missing role or permissions');
            return;
        }

        const roleId = roles[0].id;

        const rolePermissions = permissions.map(p => ({
            role_id: roleId,
            permission_id: p.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await queryInterface.bulkInsert('role_permissions', rolePermissions);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('role_permissions', null, {});
    }
};
