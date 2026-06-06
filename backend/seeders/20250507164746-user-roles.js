'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper to get ID
    const getUserId = async (email) => {
      const [users] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email = '${email}' LIMIT 1`);
      return users.length ? users[0].id : null;
    };
    const getRoleId = async (name) => {
      const [roles] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = '${name}' LIMIT 1`);
      return roles.length ? roles[0].id : null;
    };

    const assignments = [
      { email: 'super_admin@gmail.com', role: 'super-admin' },
      { email: 'admin@gmail.com', role: 'admin' },
    ];

    for (const assign of assignments) {
      const userId = await getUserId(assign.email);
      const roleId = await getRoleId(assign.role);

      if (userId && roleId) {
        const [existing] = await queryInterface.sequelize.query(`SELECT user_id FROM user_roles WHERE user_id = ${userId} AND role_id = ${roleId} LIMIT 1`);
        if (existing.length === 0) {
          await queryInterface.bulkInsert('user_roles', [{
            user_id: userId,
            role_id: roleId,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
        }
      }
    }

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('user_roles', null, {});

  }
};
