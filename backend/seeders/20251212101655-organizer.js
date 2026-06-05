'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query("SELECT * FROM organizers LIMIT 1");
    if (existing.length > 0) {
      return;
    }
    await queryInterface.bulkInsert(
      'organizers',
      [
        {
          name: 'Main Office',
          type: 'Office',
          contact_person: 'Admin Officer',
          phone: '01700000001',
          email: 'mainoffice@sentradesk.ai',
          address: 'Head Office, Dhaka',
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Community Branch',
          type: 'Branch',
          contact_person: 'Branch Coordinator',
          phone: '01700000002',
          email: 'community@sentradesk.ai',
          address: 'Community Office, Dhaka',
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Partner Organization',
          type: 'Partner',
          contact_person: 'Partner Manager',
          phone: '01700000003',
          email: 'partner@sentradesk.ai',
          address: 'Partner HQ, Bangladesh',
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'NGO Collaboration',
          type: 'NGO',
          contact_person: 'NGO Coordinator',
          phone: '01700000004',
          email: 'ngo@sentradesk.ai',
          address: 'NGO Office, Bangladesh',
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('organizers', null, {});
  },
};