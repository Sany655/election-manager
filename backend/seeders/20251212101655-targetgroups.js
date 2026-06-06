'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query("SELECT * FROM event_target_groups LIMIT 1");
    if (existing.length > 0) {
      return;
    }
    await queryInterface.bulkInsert(
      'event_target_groups',
      [
        {
          name: 'General Public',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Students',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Youth',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Women',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Seniors',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Volunteers',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Party Members',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Professionals',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_target_groups', null, {});
  },
};