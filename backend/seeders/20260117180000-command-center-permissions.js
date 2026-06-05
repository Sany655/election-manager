'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const permissions = [
            'view-command-center',
            'manage-command-center'
        ];

        // 1. Fetch all existing permission names
        const [existing] = await queryInterface.sequelize.query('SELECT name FROM permissions');
        const existingNames = new Set(existing.map(r => r.name));

        // 2. Filter new permissions
        const newPermissions = permissions
            .filter(name => !existingNames.has(name))
            .map(name => ({
                name: name,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

        // 3. Insert new permissions (if any)
        if (newPermissions.length > 0) {
            await queryInterface.bulkInsert('permissions', newPermissions);
            console.log(`Inserted ${newPermissions.length} new permissions.`);
        } else {
            console.log('All permissions already exist.');
        }

        // 4. Assign ALL new permissions to Super Admin

        // Fetch Super Admin Role ID
        const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'super-admin' LIMIT 1");
        let superAdminRoleId = 1; // Default
        if (roles.length > 0) {
            superAdminRoleId = roles[0].id;
        }

        // Get all permission IDs needed
        const [allPerms] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');

        // Get existing role permissions for Super Admin
        const [existingRolePerms] = await queryInterface.sequelize.query(
            `SELECT permission_id FROM role_permissions WHERE role_id = ${superAdminRoleId}`
        );
        const existingRolePermIds = new Set(existingRolePerms.map(rp => rp.permission_id));

        const newMappings = [];
        for (const p of allPerms) {
            if (permissions.includes(p.name)) {
                if (!existingRolePermIds.has(p.id)) {
                    newMappings.push({
                        role_id: superAdminRoleId,
                        permission_id: p.id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        if (newMappings.length > 0) {
            await queryInterface.bulkInsert('role_permissions', newMappings);
            console.log(`Assigned ${newMappings.length} new permissions to Super Admin.`);
        } else {
            console.log('Super Admin already has these permissions.');
        }
    },

    async down(queryInterface, Sequelize) {
        const permissions = [
            'view-command-center',
            'manage-command-center'
        ];
        await queryInterface.bulkDelete('permissions', { name: permissions });
    }
};
