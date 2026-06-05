'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Define permissions to be created
    const permissions = [
      // --- Core Admin ---
      'view-dashboard',

      // --- 9th Election ---
      'view-election-9th',

      // --- AI & Analytics ---
      'view-social-analytics', 'run-social-analytics',
      'view-surveys', 'create-surveys',
      'view-questionaire',

      // --- Campaign ---
      'view-campaign-overview',
      'view-campaign-roadmap',

      // --- Task Management ---
      'view-tasks', 'add-tasks', 'edit-tasks', 'delete-tasks',

      // --- Voter Management ---
      'view-voter-overview',
      'view-voters', 'add-voters', 'edit-voters', 'delete-voters',
      'view-vote-centres', 'add-vote-centres', 'edit-vote-centres', 'delete-vote-centres',

      // --- Volunteer Management ---
      'view-volunteer-overview',
      'view-volunteers', 'add-volunteers', 'edit-volunteers', 'delete-volunteers', // "Volunteer Setup"
      'view-designations', 'add-designations', 'edit-designations', 'delete-designations', // "Roles Setup"
      'view-teams', 'add-teams', 'edit-teams', 'delete-teams', // "Team Setup"

      // --- Location Setup ---
      'view-divisions', 'manage-divisions',
      'view-districts', 'manage-districts',
      'view-upazillas', 'manage-upazillas', // Thana
      'view-wards', 'manage-wards',
      'view-unions', 'manage-unions',

      // --- Event Management ---
      'view-event-overview',
      'view-events', 'add-events', 'edit-events', 'delete-events',
      'view-event-types', 'manage-event-types',
      'view-target-groups', 'manage-target-groups',
      'view-organizers', 'add-organizers', 'edit-organizers', 'delete-organizers',
      'view-resources', 'add-resources', 'edit-resources', 'delete-resources',

      // --- Communication ---
      'view-sms', 'send-sms',
      'view-whatsapp', 'send-whatsapp',
      'view-email', 'send-email',

      // --- Admin / System (The Commented Ones & Basic User Ops) ---
      'view-users', 'add-users', 'edit-users', 'delete-users',
      'view-permissions', 'add-permissions', 'edit-permissions', 'delete-permissions',
      'view-roles', 'add-roles', 'edit-roles', 'delete-roles',
      'enroll-fingerprints',
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

    // 4. Assign ALL permissions to Super Admin (Role 1)

    // Fetch Super Admin Role ID 
    // (Assuming Role 1 or searching for 'super-admin')
    const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'super-admin' LIMIT 1");
    let superAdminRoleId = 1; // Default fallback
    if (roles.length > 0) {
      superAdminRoleId = roles[0].id;
    }

    // Get all permission IDs
    const [allPerms] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');

    // Get existing role permissions for Super Admin
    const [existingRolePerms] = await queryInterface.sequelize.query(
      `SELECT permission_id FROM role_permissions WHERE role_id = ${superAdminRoleId}`
    );
    const existingRolePermIds = new Set(existingRolePerms.map(rp => rp.permission_id));

    // Filter missing mappings
    const newMappings = [];
    for (const p of allPerms) {
      // Check if this permission is in our target list (optional, but safe)
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
      console.log('Super Admin already has all target permissions.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Basic cleanup - usually risky to delete permissions in production, but here is the logic
    // We only delete what we know about
    const permissions = [
      'view-dashboard', 'view-election-9th',
      'view-social-analytics', 'run-social-analytics', 'view-surveys', 'create-surveys', 'view-questionaire',
      'view-campaign-overview', 'view-campaign-roadmap',
      'view-tasks', 'add-tasks', 'edit-tasks', 'delete-tasks',
      'view-voter-overview', 'view-voters', 'add-voters', 'edit-voters', 'delete-voters',
      'view-vote-centres', 'add-vote-centres', 'edit-vote-centres', 'delete-vote-centres',
      'view-volunteer-overview', 'view-volunteers', 'add-volunteers', 'edit-volunteers', 'delete-volunteers',
      'view-designations', 'add-designations', 'edit-designations', 'delete-designations',
      'view-teams', 'add-teams', 'edit-teams', 'delete-teams',
      'view-divisions', 'manage-divisions',
      'view-districts', 'manage-districts',
      'view-upazillas', 'manage-upazillas',
      'view-wards', 'manage-wards',
      'view-unions', 'manage-unions',
      'view-event-overview', 'view-events', 'add-events', 'edit-events', 'delete-events',
      'view-event-types', 'manage-event-types',
      'view-target-groups', 'manage-target-groups',
      'view-organizers', 'add-organizers', 'edit-organizers', 'delete-organizers',
      'view-resources', 'add-resources', 'edit-resources', 'delete-resources',
      'view-sms', 'send-sms',
      'view-whatsapp', 'send-whatsapp',
      'view-email', 'send-email',
      'view-users', 'add-users', 'edit-users', 'delete-users',
      'view-permissions', 'add-permissions', 'edit-permissions', 'delete-permissions',
      'view-roles', 'add-roles', 'edit-roles', 'delete-roles',
      'enroll-fingerprints',
    ];

    await queryInterface.bulkDelete('permissions', {
      name: permissions
    });

    // role_permissions will cascade delete or can be left alone
  }
};
