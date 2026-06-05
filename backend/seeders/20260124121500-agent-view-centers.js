'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const roleName = 'agent';
        const permissionName = 'view-vote-centres'; // Existing permission

        // 1. Get Role ID
        const [roles] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = '${roleName}' LIMIT 1`);
        if (roles.length === 0) {
            console.log(`Role ${roleName} not found.`);
            return;
        }
        const roleId = roles[0].id;

        // 2. Get Permission ID
        const [permissions] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE name = '${permissionName}' LIMIT 1`);
        if (permissions.length === 0) {
            console.log(`Permission ${permissionName} not found. Ensure it is seeded.`);
            // Fallback: Insert if missing (Unlikely if route exists, but safe)
            // await queryInterface.bulkInsert('permissions', [{ name: permissionName, createdAt: new Date(), updatedAt: new Date() }]);
            return;
        }
        const permissionId = permissions[0].id;

        // 3. Check and Assign
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
            console.log(`Assigned ${permissionName} to ${roleName}.`);
        } else {
            console.log(`${roleName} already has ${permissionName}.`);
        }
    },

    async down(queryInterface, Sequelize) {
        // Optional
    }
};
