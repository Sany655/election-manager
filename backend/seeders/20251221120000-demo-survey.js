'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM Surveys LIMIT 1");
        if (existing.length > 0) {
            return;
        }
        const surveys = [];
        const questions = [];

        for (let i = 1; i <= 5; i++) {
            const uniqueId = uuidv4();
            const surveyId = i; // Explicit ID for easier question linking (assuming auto-increment starts/continues cleanly)

            surveys.push({
                // id: surveyId, // Let database handle ID, but we need to know it for questions... 
                // In raw insert we can't easily know ID unless we set it or fetch back. 
                // For seeding, it's safer to not hardcode ID if IDs are auto-incrementing in production, 
                // but for a strict 'up' script on local, we can assume we might need to fetch or use a known offset if table is empty.
                // A better approach for robust seeding is to insert and get ID, but bulkInsert doesn't return IDs in all dialects (mysql usually doesn't).
                // Strategy: We will rely on the fact this is a demo seeder. We can try to use a placeholder or separate inserts if needed.
                // However, typical Sequelize seeder usage with associations is tricky.
                // Let's assume the table is empty or we use a consistent seed logic.
                // Re-think: We can't know the ID of the survey we just inserted in bulkInsert.
                // So we will insert surveys one by one or allow ID to be null and hope we can link them? No.
                // Best bet for seeding coupled data: Use a transaction or hardcode IDs if we clean table.
                // Let's assume we can try to hardcode IDs 1-5 for this specific seeder if we assume clean state, 
                // but since there might be data, let's use a timestamp trick or just insert separately? No, `up` needs to return a promise.

                // Simplest valid approach for standard Sequelize Seeder with related data:
                // QueryInterface.bulkInsert doesn't return instances.
                // We'll generate the data arrays assuming we can't easily link WITHOUT fetching.
                // Actually, we can just insert Surveys, then Fetch them, then Insert Questions.
                unique_id: uniqueId,
                title: `Demo Survey ${i}`,
                description: `This is a demo survey description for survey ${i}.`,
                status: 1,
                division_id: 1,
                district_id: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Insert Surveys
        await queryInterface.bulkInsert('Surveys', surveys, {});

        // Now we need to fetch them to get their IDs. 
        // This is necessary because IDs are auto-incremented.
        const insertedSurveys = await queryInterface.sequelize.query(
            `SELECT id FROM Surveys ORDER BY id DESC LIMIT 5;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        // The fetch might come back in reverse order due to DESC, let's reverse to match 1-5 logic if we care, 
        // or just iterate what we got.

        for (const survey of insertedSurveys) {
            const surveyId = survey.id;

            // Add 3-4 questions per survey
            const qCount = 3 + Math.floor(Math.random() * 2);

            for (let j = 1; j <= qCount; j++) {
                const types = ['text', 'number', 'multiple_choice', 'checkbox'];
                const type = types[Math.floor(Math.random() * types.length)];

                let options = null;
                if (type === 'multiple_choice' || type === 'checkbox') {
                    options = JSON.stringify(['Option A', 'Option B', 'Option C']);
                }

                questions.push({
                    survey_id: surveyId,
                    question: `Question ${j} for Survey ${surveyId} (${type})`,
                    type: type,
                    required: j % 2 === 0,
                    options: options,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        await queryInterface.bulkInsert('SurveyQuestions', questions, {});
    },

    down: async (queryInterface, Sequelize) => {
        // We should probably delete the specific demo surveys, but identifying them is hard without IDs.
        // For a 'demo' seeder, typically we might just truncate or delete by criteria if possible.
        // Ideally we'd store the IDs we created, but in 'down' state is stateless.
        // We'll delete where title like 'Demo Survey %'
        await queryInterface.bulkDelete('SurveyQuestions', null, {}); // Cascading might not work in bulkDelete depending on dialect options
        await queryInterface.bulkDelete('Surveys', { title: { [Sequelize.Op.like]: 'Demo Survey %' } }, {});
    }
};
