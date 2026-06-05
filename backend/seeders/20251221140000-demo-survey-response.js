const { v4: uuidv4 } = require('uuid'); // Use uuid if needed, or if not used remove. Actually I don't use it here.
// No external deps needed strictly for random numbers.
// Since I can't be sure faker is installed, I'll write a simple random generator.

// Helpers
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset(arr) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, getRandomInt(1, arr.length));
}

function getRandomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM SurveyResponses LIMIT 1");
        if (existing.length > 0) {
            return;
        }
        // 1. Fetch Demo Surveys
        const surveys = await queryInterface.sequelize.query(
            `SELECT id, unique_id, title FROM Surveys WHERE title LIKE 'Demo Survey %';`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (surveys.length === 0) {
            console.log("No demo surveys found. skipping response seeding.");
            return;
        }

        const responsesToInsert = [];
        const answersToInsert = [];

        // Track response ID manually since bulkInsert doesn't return IDs easily across dialects
        // But we need IDs to link answers. 
        // Strategy: Insert responses one by one or survey by survey to get IDs. 
        // Better: Loop surveys, for each survey loop N times, insert Response, get ID, then insert Answers.
        // This is slower but safer for data integrity in a seeder.

        for (const survey of surveys) {
            // Get Questions for this survey
            const questions = await queryInterface.sequelize.query(
                `SELECT id, type, options FROM SurveyQuestions WHERE survey_id = ${survey.id};`,
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            );

            // Generate 15-20 responses
            const responseCount = getRandomInt(15, 20);

            // Center for this survey's responses (approx Dhaka/BD center variance)
            const baseLat = 23.8 + (Math.random() - 0.5) * 2;
            const baseLon = 90.4 + (Math.random() - 0.5) * 2;

            for (let i = 0; i < responseCount; i++) {
                // 1. Create Response
                // We use raw insert and return ID
                // Note: The specific syntax for returning ID varies.
                // SQLite/Postgres: RETURNING id. MySQL: LAST_INSERT_ID() or sequence.
                // Using Sequelize Model locally would be easiest but 'models' might not be loaded in raw seeder context robustly.
                // However, queryInterface.insert returns [result, metadata]. In Postgres result is ID?
                // Let's try standard bulkInsert of 1 item with returning: true if supported? No.
                // Let's use direct SQL with queryInterface.sequelize.query.

                // Construct Date
                const createdAt = new Date(new Date() - Math.random() * 10000000000); // Random time in last ~4 months

                // Insert Response
                // Note: 'null' for id to auto-increment
                const [result] = await queryInterface.sequelize.query(
                    `INSERT INTO SurveyResponses (survey_id, respondent_ip, user_agent, latitude, longitude, createdAt, updatedAt) 
                     VALUES (${survey.id}, '127.0.0.1', 'Mozilla/5.0 (Seeder)', ${baseLat + (Math.random() - 0.5) * 0.1}, ${baseLon + (Math.random() - 0.5) * 0.1}, :createdAt, :updatedAt);`,
                    {
                        replacements: { createdAt, updatedAt: createdAt }
                    }
                );

                // Get the ID. In MySQL `result` is number (insertId). In sqlite it's similar.
                // If this is Postgres, we might need RETURNING id.
                // Assuming MySQL/SQLite based on likely setup. If postgres, query needs "RETURNING id" and result will vary.
                // Let's try a safer fetch: `SELECT MAX(id) as id FROM SurveyResponses` (not concurrency safe but ok for local seeder)
                // OR `SELECT last_insert_rowid()`

                // Fallback safe method: Get the max ID after insert.
                const [maxIdRes] = await queryInterface.sequelize.query("SELECT MAX(id) as id FROM SurveyResponses;", { type: queryInterface.sequelize.QueryTypes.SELECT });
                const responseId = maxIdRes.id;

                // 2. Generate Answers
                for (const q of questions) {
                    let ansText = null;
                    let ansJson = null;

                    if (q.type === 'text' || q.type === 'long_text') {
                        ansText = `Sample Text Answer ${i}`;
                    } else if (q.type === 'number') {
                        ansText = String(getRandomInt(1, 100));
                    } else if (q.type === 'date') {
                        ansText = getRandomDate();
                    } else if (q.type === 'multiple_choice') {
                        let opts = [];
                        try { opts = JSON.parse(q.options) } catch (e) { }
                        if (opts.length) ansText = getRandomElement(opts);
                    } else if (q.type === 'checkbox') {
                        let opts = [];
                        try { opts = JSON.parse(q.options) } catch (e) { }
                        if (opts.length) ansJson = JSON.stringify(getRandomSubset(opts));
                    }

                    if (ansText || ansJson) {
                        answersToInsert.push({
                            response_id: responseId,
                            question_id: q.id,
                            answer_text: ansText,
                            answer_json: ansJson ? JSON.parse(ansJson) : null, // Sequelize bulkInsert handles object to JSON col? check dialect.
                            // If `answer_json` column is JSON type, we pass object. 
                            // If we use bulkInsert, we usually pass object for JSON type.
                            createdAt: createdAt,
                            updatedAt: createdAt
                        });
                    }
                }
            }
        }

        // Bulk Insert Answers
        // Note: For JSON column in SQLite, passed object is stringified auto? 
        // Best to pass string for SQLite/MySQL if verify JSON isn't native? 
        // Sequelize `bulkInsert` typically expects the value to match the DB driver expectation.
        // For MySQL, JSON column takes stringified JSON or object depending on sequelize version.
        // Let's stringify `answer_json` field just in case to be safe for raw insert if JSON type support is flaky in raw seeders.
        // actually `bulkInsert` usually handles it if defined as JSON type in model? But here we don't have model instance.
        // We will stringify it.

        const finalAnswers = answersToInsert.map(a => ({
            ...a,
            answer_json: a.answer_json ? JSON.stringify(a.answer_json) : null
        }));

        if (finalAnswers.length > 0) {
            await queryInterface.bulkInsert('SurveyAnswers', finalAnswers, {});
        }
    },

    down: async (queryInterface, Sequelize) => {
        // We can't easily isolate these responses without tracking IDs, usually we Truncate in dev
        await queryInterface.bulkDelete('SurveyAnswers', null, {});
        await queryInterface.bulkDelete('SurveyResponses', null, {});
    }
};
