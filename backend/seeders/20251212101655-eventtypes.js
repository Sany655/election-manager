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
          description: 'Public political rally or gathering',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Campaign Meeting',
          description: 'Internal or external campaign meeting',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Door to Door',
          description: 'Door-to-door voter outreach activity',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Training',
          description: 'Volunteer or staff training session',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Fundraising',
          description: 'Fundraising event or donation drive',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Press Conference',
          description: 'Media briefing or press conference',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Workshop',
          description: 'Workshop or planning session',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Other',
          description: 'Other types of campaign events',
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