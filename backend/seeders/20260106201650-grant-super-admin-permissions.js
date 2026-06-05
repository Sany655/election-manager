'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Find the 'super-admin' role
        const [roles] = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'super-admin' LIMIT 1"
        );

        if (roles.length === 0) {
            console.error("Role 'super-admin' not found. Skipping seeder.");
            return;
        }

        const superAdminRoleId = roles[0].id;

        // 2. Find all permissions
        const [permissions] = await queryInterface.sequelize.query(
            "SELECT id FROM permissions"
        );

        if (permissions.length === 0) {
            console.log("No permissions found to assign.");
            return;
        }

        // 3. Find existing permissions for super-admin to avoid duplicates
        const [existingMap] = await queryInterface.sequelize.query(
            `SELECT permission_id FROM role_permissions WHERE role_id = ${superAdminRoleId}`
        );
        const existingPermissionIds = new Set(existingMap.map(entry => entry.permission_id));

        // 4. Filter out permissions the role already has
        const newPermissions = permissions
            .filter(p => !existingPermissionIds.has(p.id))
            .map(p => ({
                role_id: superAdminRoleId,
                permission_id: p.id,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

        if (newPermissions.length > 0) {
            await queryInterface.bulkInsert('role_permissions', newPermissions);
            console.log(`Assigned ${newPermissions.length} new permissions to super-admin.`);
        } else {
            console.log(`Super-admin already has all ${permissions.length} permissions.`);
        }
    },

    async down(queryInterface, Sequelize) {
        // Optionally remove permissions, but typically 'grant all' seeders might not want to strip everything on rollback
        // unless strictly required. For safety, we can leave this empty or remove only specific ones if we tracked them.
        // Given the request, we'll leave it empty to avoid accidental massive data loss on rollback of this specific step.
    }
};
