'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('agent_assignments', 'booth_number', {
            type: Sequelize.STRING, // e.g., "1", "2", "Fem-1"
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('agent_assignments', 'booth_number');
    }
};
