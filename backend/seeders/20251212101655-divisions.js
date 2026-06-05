'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query("SELECT * FROM divisions LIMIT 1");
    if (existing.length > 0) {
      return;
    }
    await queryInterface.bulkInsert(
      'divisions',
      [
        {
          id: 1,
          name: 'Chattagram',
          bn_name: 'চট্টগ্রাম',
          pcode: '10',
        },
        {
          id: 2,
          name: 'Rajshahi',
          bn_name: 'রাজশাহী',
          pcode: '15',
        },
        {
          id: 3,
          name: 'Khulna',
          bn_name: 'খুলনা',
          pcode: '20',
        },
        {
          id: 4,
          name: 'Barisal',
          bn_name: 'বরিশাল',
          pcode: '25',
        },
        {
          id: 5,
          name: 'Sylhet',
          bn_name: 'সিলেট',
          pcode: '30',
        },
        {
          id: 6,
          name: 'Dhaka',
          bn_name: 'ঢাকা',
          pcode: '35',
        },
        {
          id: 7,
          name: 'Rangpur',
          bn_name: 'রংপুর',
          pcode: '40',
        },
        {
          id: 8,
          name: 'Mymensingh',
          bn_name: 'ময়মনসিংহ',
          pcode: '45',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('divisions', null, {});
  },
};