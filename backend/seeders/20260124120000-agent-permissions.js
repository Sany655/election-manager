'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const permissions = ['report-incident'];
        const rolesToAssign = ['agent', 'super-admin'];

        // 1. Insert new permission
        const [existing] = await queryInterface.sequelize.query(`SELECT name FROM permissions WHERE name = 'report-incident'`);
        if (existing.length === 0) {
            await queryInterface.bulkInsert('permissions', [{
                name: 'report-incident',
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
            console.log('Inserted report-incident permission.');
        } else {
            console.log('report-incident permission already exists.');
        }

        // 2. Assign to Roles
        const [allPermissions] = await queryInterface.sequelize.query(`SELECT id, name FROM permissions WHERE name = 'report-incident'`);
        const permissionId = allPermissions[0]?.id;

        if (!permissionId) {
            console.error('Permission not found even after insertion check.');
            return;
        }

        for (const roleName of rolesToAssign) {
            const [roles] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = '${roleName}' LIMIT 1`);
            if (roles.length > 0) {
                const roleId = roles[0].id;

                // Check if mapping exists
                const [mapping] = await queryInterface.sequelize.query(
                    `SELECT * FROM role_permissions WHERE role_id = ${roleId} AND permission_id = ${permissionId}`
                );

                if (mapping.length === 0) {
                    await queryInterface.bulkInsert('role_permissions', [{
                        role_id: roleId,
                        permission_id: permissionId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }]);
                    console.log(`Assigned report-incident to ${roleName}.`);
                } else {
                    console.log(`${roleName} already has report-incident permission.`);
                }
            } else {
                console.log(`Role ${roleName} not found.`);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        // Optional: Remove permission and mappings
        // Not strictly doing deletion for safety in production
    }
};
