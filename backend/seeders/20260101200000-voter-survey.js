'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Check if the specific survey already exists to prevent duplicate seeding
        const [existing] = await queryInterface.sequelize.query(
            "SELECT * FROM Surveys WHERE title = 'ভোটার মতামত জরিপ (Voter Survey) -01' LIMIT 1"
        );

        if (existing.length > 0) {
            console.log('Survey already exists, skipping.');
            return;
        }

        const uniqueId = uuidv4();
        const now = new Date();

        // 1. Insert the Survey
        const surveyData = {
            unique_id: uniqueId,
            title: 'ভোটার মতামত জরিপ (Voter Survey) -01',
            description: `আসন: চট্টগ্রাম–০৭ (রাঙ্গুনিয়া)
উদ্দেশ্য: ভোটারদের সমস্যা, মনোভাব ও ভোটিং প্রবণতা বোঝা
প্রার্থী: হুমাম কাদের চৌধুরী (BNP)
সময়: ৫–৭ মিনিট
🔒 আপনার দেওয়া তথ্য গোপন রাখা হবে এবং শুধুমাত্র গবেষণা ও পরিকল্পনার কাজে ব্যবহৃত হবে।`,
            status: 1, // Published
            division_id: 1,
            district_id: 8,
            upazila_id: 65,
            union_id: 625,
            createdAt: now,
            updatedAt: now
        };

        // Need to insert and get the ID
        await queryInterface.bulkInsert('Surveys', [surveyData]);

        const [survey] = await queryInterface.sequelize.query(
            `SELECT id FROM Surveys WHERE unique_id = '${uniqueId}' LIMIT 1`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (!survey) {
            throw new Error("Failed to retrieve inserted survey ID");
        }

        const surveyId = survey.id;

        // 2. Insert Questions
        const questions = [
            {
                question: 'আপনার লিঙ্গ কী?',
                type: 'multiple_choice',
                options: JSON.stringify(['পুরুষ', 'নারী', 'অন্যান্য']),
                required: true
            },
            {
                question: 'আপনার বয়স কত?',
                type: 'multiple_choice',
                options: JSON.stringify(['১৮–২৫', '২৬–৩৫', '৩৬–৪৫', '৪৬–৬০', '৬০+']),
                required: true
            },
            {
                question: 'আপনার পেশা কী?',
                type: 'multiple_choice',
                options: JSON.stringify(['কৃষক', 'ব্যবসায়ী', 'চাকরিজীবী', 'শিক্ষার্থী', 'গৃহিণী', 'প্রবাসী', 'অন্যান্য']),
                required: true
            },
            {
                question: 'সাধারণত আপনি কোন দলের প্রতি বেশি সমর্থন অনুভব করেন?',
                type: 'multiple_choice',
                options: JSON.stringify(['বিএনপি', 'আওয়ামী লীগ', 'জামায়াত', 'অন্যান্য', 'নিরপেক্ষ']),
                required: true
            },
            {
                question: 'আপনার মতে বর্তমানে রাঙ্গুনিয়ার সবচেয়ে বড় সমস্যা কোনটি? (একাধিক হতে পারে)',
                type: 'checkbox',
                options: JSON.stringify([
                    'কর্মসংস্থান',
                    'রাস্তাঘাট ও অবকাঠামো',
                    'শিক্ষা',
                    'স্বাস্থ্যসেবা',
                    'কৃষি ও সেচ',
                    'আইন-শৃঙ্খলা',
                    'দ্রব্যমূল্য',
                    'অন্যান্য'
                ]),
                required: true
            },
            {
                question: 'আপনি কি হুমাম কাদের চৌধুরী সম্পর্কে জানেন?',
                type: 'multiple_choice',
                options: JSON.stringify(['ভালোভাবে জানি', 'নাম শুনেছি', 'জানি না']),
                required: true
            },
            {
                question: 'প্রার্থী হিসেবে তাঁর সম্পর্কে আপনার ধারণা কেমন?',
                type: 'multiple_choice',
                options: JSON.stringify(['খুব ভালো', 'ভালো', 'মাঝারি', 'খারাপ', 'মন্তব্য নেই']),
                required: false
            },
            {
                question: 'আপনি কি মনে করেন তিনি রাঙ্গুনিয়ার উন্নয়নে কাজ করতে পারবেন?',
                type: 'multiple_choice',
                options: JSON.stringify(['অবশ্যই', 'সম্ভব', 'সন্দেহ আছে', 'না']),
                required: true
            },
            {
                question: 'আপনার মতে রাঙ্গুনিয়ার উন্নয়নের জন্য সবচেয়ে জরুরি কাজ কী?',
                type: 'text',
                options: null,
                required: true
            },
            {
                question: 'প্রার্থী বা দলের জন্য আপনার কোনো পরামর্শ থাকলে লিখুন:',
                type: 'text',
                options: null,
                required: false
            }
        ];

        const questionsPayload = questions.map(q => ({
            survey_id: surveyId,
            question: q.question,
            type: q.type,
            options: q.options,
            required: q.required,
            createdAt: now,
            updatedAt: now
        }));

        await queryInterface.bulkInsert('SurveyQuestions', questionsPayload);
    },

    down: async (queryInterface, Sequelize) => {
        const [survey] = await queryInterface.sequelize.query(
            "SELECT id FROM Surveys WHERE title = 'ভোটার মতামত জরিপ (Voter Survey) -01' LIMIT 1",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (survey) {
            await queryInterface.bulkDelete('SurveyQuestions', { survey_id: survey.id }, {});
            await queryInterface.bulkDelete('Surveys', { id: survey.id }, {});
        }
    }
};
