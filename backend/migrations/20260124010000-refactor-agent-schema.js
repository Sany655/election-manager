'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1. Modify agent_assignments table
            // Remove old foreign key constraint if it exists (might need actual name from DB, but try standard naming)
            // await queryInterface.removeConstraint('agent_assignments', 'agent_assignments_agent_id_fkey', { transaction });

            // Change agent_id to INTEGER and nullable (temporarily) or handle data migration if needed. 
            // Since we are "deleting" agent profile table, old data might be invalid unless mapped. 
            // For now, let's assume valid data or we just alter column.

            // Note: Changing UUID to INTEGER is destructive if data exists. 
            // Provided instruction implies "delete agent profile table completely", so we likely start fresh or accept data loss on agent_id.

            // Drop column and re-add is safest for type change UUID -> INTEGER
            await queryInterface.removeColumn('agent_assignments', 'agent_id', { transaction });
            await queryInterface.addColumn('agent_assignments', 'agent_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });

            // 2. Modify incident_reports table
            await queryInterface.removeColumn('incident_reports', 'agent_id', { transaction });
            await queryInterface.addColumn('incident_reports', 'agent_id', {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });

            // 3. Modify user_personal_details table
            await queryInterface.addColumn('user_personal_details', 'home_geo_location', {
                type: Sequelize.GEOMETRY('POINT'),
                allowNull: true
            }, { transaction });

            // 4. Drop agent_profiles table
            await queryInterface.dropTable('agent_profiles', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert user_personal_details
            await queryInterface.removeColumn('user_personal_details', 'home_geo_location', { transaction });

            // Recreate agent_profiles table (basic structure)
            await queryInterface.createTable('agent_profiles', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4
                },
                user_id: {
                    type: Sequelize.INTEGER
                },
                full_name: {
                    type: Sequelize.STRING
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            }, { transaction });

            // Revert incident_reports
            await queryInterface.removeColumn('incident_reports', 'agent_id', { transaction });
            await queryInterface.addColumn('incident_reports', 'agent_id', {
                type: Sequelize.UUID
            }, { transaction });

            // Revert agent_assignments
            await queryInterface.removeColumn('agent_assignments', 'agent_id', { transaction });
            await queryInterface.addColumn('agent_assignments', 'agent_id', {
                type: Sequelize.UUID
            }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
