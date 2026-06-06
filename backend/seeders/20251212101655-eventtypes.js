'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const [existing] = await queryInterface.sequelize.query("SELECT * FROM event_types LIMIT 1");
    if (existing.length > 0) {
      return;
    }
    await queryInterface.bulkInsert(
      'event_types',
      [
        {
          name: 'Rally',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Campaign Meeting',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Door to Door',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Training',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Fundraising',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Press Conference',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Workshop',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Other',
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_types', null, {});
  },
};