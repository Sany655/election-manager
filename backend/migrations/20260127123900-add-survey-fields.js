'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('surveys', 'is_geo_location_required', {
            type: Sequelize.TINYINT,
            defaultValue: 0,
            allowNull: true
        });

        await queryInterface.addColumn('surveys', 'bottom_note', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('surveys', 'is_geo_location_required');
        await queryInterface.removeColumn('surveys', 'bottom_note');
    }
};
