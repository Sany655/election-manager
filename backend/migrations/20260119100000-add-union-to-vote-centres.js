'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('vote_centres', 'union_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'unions', // name of the Target model
                key: 'id', // key in Target model
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('vote_centres', 'union_id');
    }
};
