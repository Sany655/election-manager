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
          description: 'Open to all citizens',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Students',
          description: 'School, college, and university students',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Youth',
          description: 'Young people and youth organizations',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Women',
          description: 'Women-focused programs and audiences',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Senior Citizens',
          description: 'Elderly citizens',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Volunteers',
          description: 'Registered volunteers and activists',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Party Members',
          description: 'Internal party members',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Professionals',
          description: 'Doctors, engineers, lawyers, teachers, etc.',
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