'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Update vote_centres table
        /*
        await queryInterface.addColumn('vote_centres', 'latitude', {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
        await queryInterface.addColumn('vote_centres', 'longitude', {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
        await queryInterface.addColumn('vote_centres', 'risk_level', {
            type: Sequelize.ENUM('HIGH', 'MEDIUM', 'LOW'),
            defaultValue: 'LOW',
            allowNull: true,
        });
        */

        // Update agent_profiles table
        /*
        await queryInterface.addColumn('agent_profiles', 'agent_unique_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        });
        await queryInterface.addColumn('agent_profiles', 'email', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        // Assuming assigned_union_id references unions table
        await queryInterface.addColumn('agent_profiles', 'assigned_union_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        */
    },

    down: async (queryInterface, Sequelize) => {
        // Revert vote_centres changes
        await queryInterface.removeColumn('vote_centres', 'latitude');
        await queryInterface.removeColumn('vote_centres', 'longitude');
        await queryInterface.removeColumn('vote_centres', 'risk_level');
        // Note: ENUM types often need special handling to be dropped in some DBs, but removeColumn usually handles the column drop.

        // Revert agent_profiles changes
        await queryInterface.removeColumn('agent_profiles', 'agent_unique_id');
        await queryInterface.removeColumn('agent_profiles', 'email');
        await queryInterface.removeColumn('agent_profiles', 'assigned_union_id');
    }
};
