'use strict';
// const voteCentresData = require('../data/vote_centres.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        let voteCentresData = [];
        try {
            voteCentresData = require('../data/vote_centres.json');
        } catch (e) {
            voteCentresData = [];
        }
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM vote_centres LIMIT 1");
        if (existing.length > 0) {
            return;
        }
        const records = [];
        if (voteCentresData.length > 0) {
            voteCentresData.forEach(unionData => {
                unionData.vote_centres.forEach(centre => {
                    records.push({
                        upozilla_name: unionData.upozilla_name,
                        type: unionData.type,
                        serial: centre.serial,
                        name: centre.name,
                        booth_count: centre.booth_count,
                        voter_area: centre.voter_area,
                        male_voters: centre.voters.male,
                        female_voters: centre.voters.female,
                        hijra_voters: centre.voters.hijra,
                        total_voters: centre.voters.total,
                        remarks: centre.remarks,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                });
            });
        }


        console.log(`Vote Centres Seeder: Found ${records.length} records to insert.`);

        if (records.length > 0) {
            await queryInterface.bulkInsert('vote_centres', records, {});
        } else {
            console.log("Vote Centres Seeder: No records to insert.");
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('vote_centres', null, {});
    }
};
