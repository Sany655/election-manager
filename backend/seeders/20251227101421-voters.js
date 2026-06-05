'use strict';
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // const [existing] = await queryInterface.sequelize.query("SELECT * FROM voters LIMIT 1");
    // if (existing.length > 0) {
    //   console.log('Voters table already has data. Skipping.');
    //   return;
    // }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Fetching location data for mapping...');

      const [upazillas] = await queryInterface.sequelize.query(
        `SELECT u.id, u.name, u.bn_name, u.district_id, d.division_id 
         FROM upazillas u 
         JOIN districts d ON u.district_id = d.id`,
        { transaction }
      );

      const [unions] = await queryInterface.sequelize.query(
        `SELECT id, name, bn_name, upazilla_id FROM unions`,
        { transaction }
      );

      // Create lookup maps
      const upazilaMap = new Map();
      upazillas.forEach(u => {
        if (u.name) upazilaMap.set(u.name.trim().toLowerCase(), u);
        if (u.bn_name) upazilaMap.set(u.bn_name.trim(), u);
      });

      const unionMap = new Map();
      unions.forEach(u => {
        if (u.name) unionMap.set(`${u.upazilla_id}_${u.name.trim().toLowerCase()}`, u.id);
        if (u.bn_name) unionMap.set(`${u.upazilla_id}_${u.bn_name.trim()}`, u.id);
      });

      const processedNIDs = new Set();
      // Pre-load existing NIDs to avoid duplicates if re-seeding partially
      const [existingNIDs] = await queryInterface.sequelize.query("SELECT nid FROM voters", { transaction });
      existingNIDs.forEach(v => processedNIDs.add(v.nid));

      const BATCH_SIZE = 1000;
      let totalProcessed = 0;
      let totalInserted = 0;

      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        console.error("Data directory not found!");
        await transaction.commit();
        return;
      }


      const files = fs.readdirSync(dataDir).filter(f => f.startsWith('voters_chunk_') && f.endsWith('.json'));
      console.log(`Found ${files.length} chunk files to process.`);

      for (const file of files) {
        console.log(`Processing ${file}...`);
        const chunkPath = path.join(dataDir, file);
        const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));

        const votersToInsert = [];

        for (const voter of chunkData) {
          // 1. Resolve Upazila
          const upazilaName = voter.upazila;
          if (!upazilaName) continue;
          const upazilaKey = upazilaName.trim().toLowerCase();
          const upazilaInfo = upazilaMap.get(upazilaKey);

          if (!upazilaInfo) {
            // console.warn(`Upazila not found: ${upazilaName}`);
            continue;
          }

          // 2. Resolve Union
          const unionName = voter.union;
          if (!unionName) continue;
          const unionKey = `${upazilaInfo.id}_${unionName.trim().toLowerCase()}`;
          let unionId = unionMap.get(unionKey);

          if (!unionId) {
            // console.warn(`Union not found: ${unionName} in ${upazilaName}`);
            continue;
          }

          // 3. Process Voter Details
          const nid = voter['Voter No'] ? String(voter['Voter No']).trim() : null;
          if (!nid || processedNIDs.has(nid)) continue;
          processedNIDs.add(nid);

          // Age Calc
          let age = 0;
          if (voter.DOB) {
            const dobEnglish = voter.DOB.replace(/[০-৯]/g, d => "0123456789".indexOf(d));
            const dateParts = dobEnglish.split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10);
              const year = parseInt(dateParts[2], 10);
              if (!isNaN(year)) {
                age = new Date().getFullYear() - year;
              }
            }
          }
          if (age <= 0) age = 18;

          // Gender
          let gender = 'Other';
          const sourceFile = voter.SourceFile || '';
          if (sourceFile.toLowerCase().includes('_male_')) gender = 'Male';
          else if (sourceFile.toLowerCase().includes('_female_')) gender = 'Female';

          const name = voter.Name ? voter.Name.trim().replace(/,$/, '') : 'Unknown';
          const profession = voter.Occupation || 'Unknown';

          votersToInsert.push({
            name: name,
            age: age,
            gender: gender,
            nid: nid,
            phone: null,
            profession: profession,
            division_id: upazilaInfo.division_id,
            district_id: upazilaInfo.district_id,
            upazilla_id: upazilaInfo.id,
            union_id: unionId,
            ward: voter.ward_no || 'Unknown',
            voter_center: voter.voter_area_name || 'Unknown',
            created_at: new Date(),
            updated_at: new Date()
          });

          if (votersToInsert.length >= BATCH_SIZE) {
            await queryInterface.bulkInsert('voters', votersToInsert, { transaction });
            totalInserted += votersToInsert.length;
            votersToInsert.length = 0;
          }
        }
        if (votersToInsert.length > 0) {
          await queryInterface.bulkInsert('voters', votersToInsert, { transaction });
          totalInserted += votersToInsert.length;
        }
      }

      console.log(`Seeding completed. Total voters inserted: ${totalInserted}`);
      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding voters:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Dangerous to delete all, but standard for 'down'
    await queryInterface.bulkDelete('voters', null, {});
  }
};
