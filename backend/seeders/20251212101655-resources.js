'use strict';
/** @type {import('sequelize-cli').Seeder} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query("SELECT * FROM resources LIMIT 1");
    if (existing.length > 0) {
      return;
    }
    await queryInterface.bulkInsert('resources', [
      {
        name: 'Chair',
        category: 'Furniture',
        unit: 'piece',
        rate_per_day: 30.00,
        description: 'Plastic or wooden chair for events',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Table',
        category: 'Furniture',
        unit: 'piece',
        rate_per_day: 150.00,
        description: 'Standard event table',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Microphone',
        category: 'Audio',
        unit: 'piece',
        rate_per_day: 500.00,
        description: 'Wired or wireless microphone',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Plate',
        category: 'Catering',
        unit: 'piece',
        rate_per_day: 5.00,
        description: 'Reusable serving plate',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Glass',
        category: 'Catering',
        unit: 'piece',
        rate_per_day: 5.00,
        description: 'Water or soft drink glass',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('resources', {
      name: ['Chair', 'Table', 'Microphone', 'Plate', 'Glass']
    });
  }
};