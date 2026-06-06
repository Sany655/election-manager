'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const roles = [
      { name: 'super-admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'member', createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const role of roles) {
      const [existing] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = '${role.name}' LIMIT 1`);
      if (existing.length === 0) {
        await queryInterface.bulkInsert('roles', [role]);
      }
    }

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('roles', null, {});

  }
};
