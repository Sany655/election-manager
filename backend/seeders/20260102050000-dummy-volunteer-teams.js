'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // 1. Fetch 'volunteer' role ID
            const [roles] = await queryInterface.sequelize.query(
                `SELECT id FROM roles WHERE name = 'volunteer' LIMIT 1;`,
                { transaction }
            );

            if (!roles.length) {
                console.warn('Role "volunteer" not found. Skipping team seeding.');
                await transaction.commit();
                return;
            }
            const volunteerRoleId = roles[0].id;

            // 2. Fetch Users with 'volunteer' role
            const [volunteers] = await queryInterface.sequelize.query(
                `
        SELECT u.id, u.name, u.division_id, u.district_id, u.upazilla_id, u.union_id 
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role_id = :roleId
        `,
                {
                    replacements: { roleId: volunteerRoleId },
                    transaction
                }
            );

            if (!volunteers.length) {
                console.warn('No volunteers found. Skipping team seeding.');
                await transaction.commit();
                return;
            }

            // 3. Group volunteers by Union (or location)
            const volunteersByLocation = {};
            const noLocationVolunteers = [];

            for (const vol of volunteers) {
                if (vol.union_id) {
                    if (!volunteersByLocation[vol.union_id]) {
                        volunteersByLocation[vol.union_id] = {
                            division_id: vol.division_id,
                            district_id: vol.district_id,
                            upazilla_id: vol.upazilla_id,
                            union_id: vol.union_id,
                            members: []
                        };
                    }
                    volunteersByLocation[vol.union_id].members.push(vol);
                } else {
                    noLocationVolunteers.push(vol);
                }
            }

            // 4. Fetch fallback location if needed
            let fallbackLocation = null;
            if (noLocationVolunteers.length > 0) {
                if (Object.keys(volunteersByLocation).length > 0) {
                    // Use the first available group as fallback
                    const firstKey = Object.keys(volunteersByLocation)[0];
                    fallbackLocation = { ...volunteersByLocation[firstKey] };
                    delete fallbackLocation.members; // Clean up
                } else {
                    // Fetch one valid location hierarchy from DB
                    // Assuming standard hierarchy linkage
                    const [validLocs] = await queryInterface.sequelize.query(
                        `
             SELECT u.id as union_id, u.upazilla_id, up.district_id, d.division_id
             FROM unions u
             JOIN upazillas up ON u.upazilla_id = up.id
             JOIN districts d ON up.district_id = d.id
             LIMIT 1;
             `,
                        { transaction }
                    );

                    if (validLocs.length) {
                        fallbackLocation = validLocs[0];
                    }
                }
            }

            // Distribute noLocationVolunteers
            if (noLocationVolunteers.length > 0 && fallbackLocation) {
                if (!volunteersByLocation[fallbackLocation.union_id]) {
                    volunteersByLocation[fallbackLocation.union_id] = {
                        ...fallbackLocation,
                        members: []
                    };
                }
                volunteersByLocation[fallbackLocation.union_id].members.push(...noLocationVolunteers);
            }

            const teamMemberInserts = [];
            const now = new Date();

            // Fetch Union Names for naming
            const usedUnionIds = Object.keys(volunteersByLocation);
            const unionNamesMap = {};
            if (usedUnionIds.length > 0) {
                const [unions] = await queryInterface.sequelize.query(
                    `SELECT id, name FROM unions WHERE id IN (:ids)`,
                    {
                        replacements: { ids: usedUnionIds },
                        transaction
                    }
                );
                unions.forEach(u => unionNamesMap[u.id] = u.name);
            }

            // 5. Create Teams
            for (const unionId of Object.keys(volunteersByLocation)) {
                const group = volunteersByLocation[unionId];
                const members = group.members;
                const unionName = unionNamesMap[unionId] || 'General';

                const chunkSize = 15; // Max 15 members per team
                for (let i = 0; i < members.length; i += chunkSize) {
                    const chunk = members.slice(i, i + chunkSize);
                    const teamIndex = Math.floor(i / chunkSize) + 1;
                    const teamName = `${unionName} Volunteer Team ${teamIndex}`;
                    const leaderId = chunk[0].id;

                    // Insert Team and get ID
                    // Using default raw query behavior implies first element of return is results.
                    // For INSERT in MySQL, results is the insertId.
                    const [teamId] = await queryInterface.sequelize.query(
                        `INSERT INTO volunteer_teams (name, leader_id, description, division_id, district_id, upazilla_id, union_id, createdAt, updatedAt) 
                   VALUES (:name, :leaderId, :description, :divisionId, :districtId, :upazillaId, :unionId, :createdAt, :updatedAt)`,
                        {
                            replacements: {
                                name: teamName,
                                leaderId: leaderId,
                                description: `Volunteer team for ${unionName}`,
                                divisionId: group.division_id || null,
                                districtId: group.district_id || null,
                                upazillaId: group.upazilla_id || null,
                                unionId: group.union_id,
                                createdAt: now,
                                updatedAt: now
                            },
                            transaction
                        }
                    );

                    // Add members of this chunk to the team
                    chunk.forEach(member => {
                        teamMemberInserts.push({
                            user_id: member.id,
                            volunteer_team_id: teamId,
                            createdAt: now,
                            updatedAt: now
                        });
                    });
                }
            }

            // 6. Bulk Insert Members
            if (teamMemberInserts.length > 0) {
                await queryInterface.bulkInsert('volunteer_team_members', teamMemberInserts, { transaction });
            }

            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error('Error seeding volunteer teams:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('volunteer_team_members', null, {});
        await queryInterface.bulkDelete('volunteer_teams', null, {});
    }
};
