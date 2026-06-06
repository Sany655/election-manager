'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const salt = await bcrypt.genSalt(10);
    const hashedPass1 = await bcrypt.hash('super_123_admin', salt);
    const hashedPass2 = await bcrypt.hash('123456', salt);
    const hashedPassMember = await bcrypt.hash('123456', salt);

    const generateEmployeeId = () => {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      return `EMP${randomNum}`;
    };

    const users = [
      {
        name: 'Super Admin',
        email: 'super_admin@gmail.com',
        password: hashedPass1,
        employee_id: generateEmployeeId()
      },
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPass2,
        employee_id: generateEmployeeId()
      },
      { name: 'member 1', email: 'member1@gmail.com', password: hashedPassMember, employee_id: generateEmployeeId() },
      { name: 'member 2', email: 'member2@gmail.com', password: hashedPassMember, employee_id: generateEmployeeId() },
      { name: 'member 3', email: 'member3@gmail.com', password: hashedPassMember, employee_id: generateEmployeeId() },
      { name: 'member 4', email: 'member4@gmail.com', password: hashedPassMember, employee_id: generateEmployeeId() },
      { name: 'member 5', email: 'member5@gmail.com', password: hashedPassMember, employee_id: generateEmployeeId() }
    ];

    for (const user of users) {
      const [existing] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email = '${user.email}' LIMIT 1`);
      if (existing.length === 0) {
        await queryInterface.bulkInsert('users', [{
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('users', null, {});

  }
};
