'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      'view-candidates',
      'manage-candidates'
    ];

    // Fetch existing
    const [existing] = await queryInterface.sequelize.query('SELECT name FROM permissions');
    const existingNames = new Set(existing.map(r => r.name));

    // Filter new
    const newPermissions = permissions
      .filter(name => !existingNames.has(name))
      .map(name => ({
        name: name,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (newPermissions.length > 0) {
      await queryInterface.bulkInsert('permissions', newPermissions);
      console.log(`Inserted ${newPermissions.length} new candidate permissions.`);
    }

    // Get the permission IDs
    const [insertedPerms] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN ('view-candidates', 'manage-candidates')`
    );

    if (insertedPerms.length > 0) {
      // Assign to super-admin (role 1) and admin (role 2 if it exists)
      const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name IN ('super-admin', 'admin')");
      
      const rolePermissionsToInsert = [];

      for (const role of roles) {
        // Check existing for this role
        const [existingRolePerms] = await queryInterface.sequelize.query(
          `SELECT permission_id FROM role_permissions WHERE role_id = ${role.id}`
        );
        const existingPermIds = new Set(existingRolePerms.map(rp => rp.permission_id));

        for (const perm of insertedPerms) {
          if (!existingPermIds.has(perm.id)) {
            rolePermissionsToInsert.push({
              role_id: role.id,
              permission_id: perm.id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }

      if (rolePermissionsToInsert.length > 0) {
        await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert);
        console.log(`Assigned candidate permissions to super-admin and admin.`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const [perms] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN ('view-candidates', 'manage-candidates')`
    );

    if (perms.length > 0) {
      const permIds = perms.map(p => p.id);
      await queryInterface.bulkDelete('role_permissions', {
        permission_id: { [Sequelize.Op.in]: permIds }
      });
      await queryInterface.bulkDelete('permissions', {
        id: { [Sequelize.Op.in]: permIds }
      });
    }
  }
};
