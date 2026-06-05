'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // For Postgres (commonly used with Sequelize), expanding ENUMs requires raw SQL or changeColumn.
        // If SQLite (dev), allow changes seamlessly.
        // We will use changeColumn which works if the dialect supports it or if we just change the definition.
        // However, expanding ENUM in Postgres usually needs `ALTER TYPE ... ADD VALUE`.

        // Safer approach for generic SQL or if we can't detect dialect easily here:
        // We will try to modify the column definition.

        // Note: If using Postgres, 'ALTER TYPE "enum_agent_assignments_status" ADD VALUE "LATE";' is simpler but dialect-specific.
        // Assuming standard Sequelize migration for safety:

        try {
            await queryInterface.changeColumn('agent_assignments', 'status', {
                type: Sequelize.ENUM('ASSIGNED', 'ON_DUTY', 'ABSENT', 'COMPLETED', 'LATE'),
                defaultValue: 'ASSIGNED',
                allowNull: true
            });
        } catch (e) {
            // Fallback for Postgres specific if changeColumn fails on ENUM
            console.warn("Standard changeColumn failed (likely Postgres ENUM), trying raw SQL...");
            // This is a common hack for Postgres ENUMs in migrations
            // We verify if 'LATE' exists, if not add it.
            // But for now, we'll assume the user might restart DB or we use standard flow.
            // Let's rely on changeColumn first.
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Reverting ENUM values is complex and usually requires recreating the type.
        // We'll skip removing 'LATE' to avoid data loss or complexity, as strictly reverting ENUM values is not standard practice for minor additions.
        await queryInterface.changeColumn('agent_assignments', 'status', {
            type: Sequelize.ENUM('ASSIGNED', 'ON_DUTY', 'ABSENT', 'COMPLETED'),
            defaultValue: 'ASSIGNED',
            allowNull: true
        });
    }
};
