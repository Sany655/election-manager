const { Survey, SurveyQuestion, User, SurveyResponse, SurveyAnswer, sequelize } = require('../models');
const { verifyGeoLocation } = require('../utils/geoUtils');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Groq = require('groq-sdk');

const surveyController = {};

// AI Generate Survey
surveyController.generateSurvey = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set");
            return res.status(500).json({ message: "AI service configuration error" });
        }

        const systemInstruction = `
            You are an expert survey creator. Create a comprehensive survey based on the user's prompt.
            Output purely valid JSON with no markdown formatting.
            Structure:
            {
                "title": "Survey Title",
                "description": "Short description",
                "questions": [
                    {
                        "text": "Question text",
                        "type": "text" | "long_text" | "number" | "multiple_choice" | "checkbox" | "date",
                        "options": ["Option 1", "Option 2"], // Required for multiple_choice (Single Choice Radio) and checkbox (Multiple Choice Checkbox)
                        "required": boolean
                    }
                ]
            }
            Ensure questions are relevant and diverse. Use specific types where appropriate.
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: `Create a survey for: ${prompt}\n\n${systemInstruction}` }]
                }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;

        // Clean markdown code blocks if present
        const jsonString = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        const surveyData = JSON.parse(jsonString);

        res.status(200).json(surveyData);

    } catch (error) {
        console.error("AI Generation Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to generate survey" });
    }
};

// Submit Survey Response
surveyController.submitResponse = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { uniqueId } = req.params;
        const { answers, latitude, longitude } = req.body;
        const user_agent = req.headers['user-agent'];
        const respondent_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const survey = await Survey.findOne({
            where: uniqueId.length > 5 ? { unique_id: uniqueId } : { id: uniqueId },
            include: [
                { model: require('../models').District, as: 'district' } // Ensure association exists or fetch separately if needed
                // Note: Standard Survey model might not include District directly if alias is not default.
                // Checking Model: Survey.belongsTo(District) isn't explicit in snippet, but field district_id exists.
                // Let's fetch District separately to be safe and avoid include errors if association alias mismatch.
            ]
        });

        if (!survey) {
            await transaction.rollback();
            return res.status(404).json({ message: "Survey not found" });
        }

        if (survey.status === 0) {
            await transaction.rollback();
            return res.status(403).json({ message: "This survey is currently not available." });
        }

        // --- GEO VALIDATION ---
        if (survey.is_geo_location_required && (!latitude || !longitude)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Location access is required to submit this survey." });
        }

        if (latitude && longitude) {
            const { isValid, message } = await verifyGeoLocation(survey, parseFloat(latitude), parseFloat(longitude));

            if (!isValid) {
                await transaction.rollback();
                console.log(`Geo Verification Failed: ${message}`);
                return res.status(400).json({ message: message || "Location verification failed." });
            }
        }
        // --------------------------------------

        // Create Response Entry
        const response = await SurveyResponse.create({
            survey_id: survey.id,
            respondent_ip,
            user_agent,
            latitude,
            longitude
        }, { transaction });

        if (answers && answers.length > 0) {
            const answerData = answers.map(ans => ({
                response_id: response.id,
                question_id: ans.question_id,
                answer_text: typeof ans.answer === 'object' ? null : String(ans.answer),
                answer_json: typeof ans.answer === 'object' ? ans.answer : null
            }));

            await SurveyAnswer.bulkCreate(answerData, { transaction });
        }

        await transaction.commit();
        res.status(201).json({ message: "Response submitted successfully", id: response.id });

    } catch (error) {
        await transaction.rollback();
        console.error("Submit Response Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete Survey
surveyController.deleteSurvey = async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const { force } = req.query; // Check for force flag
        const whereClause = uniqueId.length > 5 ? { unique_id: uniqueId } : { id: uniqueId };

        const survey = await Survey.findOne({ where: whereClause });
        if (!survey) return res.status(404).json({ message: "Survey not found" });

        // Check for responses
        const responseCount = await SurveyResponse.count({ where: { survey_id: survey.id } });

        if (responseCount > 0 && force !== 'true') {
            return res.status(409).json({
                message: `This survey has ${responseCount} response(s). Deleting it will permanently remove all associated data.`,
                requiresConfirmation: true
            });
        }

        // Proceed with delete (cascade manual if needed or rely on DB hooks)
        if (responseCount > 0) {
            await SurveyResponse.destroy({ where: { survey_id: survey.id } });
        }
        await SurveyQuestion.destroy({ where: { survey_id: survey.id } });
        await survey.destroy();

        res.status(200).json({ message: "Survey deleted successfully" });
    } catch (error) {
        console.error("Delete Survey Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Survey
surveyController.updateSurvey = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { uniqueId } = req.params;
        const { title, description, location, questions } = req.body;

        const survey = await Survey.findOne({ where: uniqueId.length > 5 ? { unique_id: uniqueId } : { id: uniqueId } });
        if (!survey) {
            await transaction.rollback();
            return res.status(404).json({ message: "Survey not found" });
        }

        // Check for existing responses
        const responseCount = await SurveyResponse.count({ where: { survey_id: survey.id }, transaction });
        const hasResponses = responseCount > 0;

        // Update Basic Info
        await survey.update({
            title,
            description,
            division_id: location?.division,
            district_id: location?.district,
            upazila_id: location?.upazila,
            union_id: location?.union,
            status: req.body.status !== undefined ? req.body.status : survey.status,
            is_geo_location_required: req.body.is_geo_location_required !== undefined ? (req.body.is_geo_location_required ? 1 : 0) : survey.is_geo_location_required,
            bottom_note: req.body.bottom_note !== undefined ? req.body.bottom_note : survey.bottom_note
        }, { transaction });

        if (questions && questions.length > 0) {
            if (hasResponses) {
                // Cannot update questions if responses exist
                // We will silently ignore question updates or could warn user.
                // For now, logging it.
                console.log(`Survey ${uniqueId} has responses. Skipping question updates.`);
            } else {
                // DELETE old questions
                await SurveyQuestion.destroy({ where: { survey_id: survey.id }, transaction });

                // CREATE new questions
                const questionData = questions.map(q => ({
                    survey_id: survey.id,
                    question: q.text || q.question, // Support both keys
                    type: q.type || 'text',
                    options: q.options, // Pass options directly as received
                    required: q.required || false,
                    validation: q.validation ? (typeof q.validation === 'object' ? JSON.stringify(q.validation) : q.validation) : null
                }));

                await SurveyQuestion.bulkCreate(questionData, { transaction });
            }
        }

        await transaction.commit();
        res.status(200).json({
            message: "Survey updated successfully",
            warning: hasResponses ? "Questions were not updated because survey has responses." : null
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Update Survey Error:", error);
        res.status(500).json({ message: "Internal server error " + error.message });
    }
};
surveyController.getSurveyAnalytics = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        const survey = await Survey.findOne({
            where: uniqueId.length > 5 ? { unique_id: uniqueId } : { id: uniqueId },
            include: [{ model: SurveyQuestion, as: 'questions' }]
        });

        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // 1. Total Responses
        const totalResponses = await SurveyResponse.count({ where: { survey_id: survey.id } });

        // 2. Geolocation Data (Heatmap)
        const locations = await SurveyResponse.findAll({
            where: { survey_id: survey.id },
            attributes: ['latitude', 'longitude'],
            raw: true
        });
        // Filter out nulls
        const validLocations = locations.filter(l => l.latitude && l.longitude);

        // 3. Question Analytics
        // We will fetch answers for each question. 
        // Optimization: Fetch all answers for this survey's responses? 
        // Or fetch per question? Per question is cleaner for logic separation.

        const analytics = await Promise.all(survey.questions.map(async (q) => {
            const stats = {
                id: q.id,
                question: q.question,
                type: q.type,
                total: 0,
                data: null
            };

            // Fetch ALL answers for this question
            const answers = await SurveyAnswer.findAll({
                where: { question_id: q.id },
                attributes: ['answer_text', 'answer_json', 'createdAt'],
                order: [['createdAt', 'DESC']],
                raw: true
            });
            stats.total = answers.length;

            if (q.type === 'multiple_choice' || q.type === 'checkbox' || q.type === 'date') {
                const counts = {};

                answers.forEach(a => {
                    // Normalize Answer
                    let val = a.answer_text;
                    const jsonVal = a.answer_json;

                    if (Array.isArray(jsonVal)) {
                        jsonVal.forEach(v => {
                            if (v) counts[v] = (counts[v] || 0) + 1;
                        });
                    } else if (val) {
                        counts[val] = (counts[val] || 0) + 1;
                    } else if (jsonVal) {
                        counts[jsonVal] = (counts[jsonVal] || 0) + 1;
                    }
                });

                // Sort dates if type is date
                let chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
                if (q.type === 'date') {
                    chartData.sort((a, b) => new Date(a.name) - new Date(b.name));
                }

                stats.data = chartData;

            } else if (q.type === 'number') {
                const values = answers
                    .map(a => parseFloat(a.answer_text))
                    .filter(v => !isNaN(v));

                if (values.length > 0) {
                    const sum = values.reduce((a, b) => a + b, 0);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const avg = (sum / values.length).toFixed(2);

                    // Frequency for Chart
                    const counts = {};
                    values.forEach(v => {
                        counts[v] = (counts[v] || 0) + 1;
                    });
                    const chartData = Object.entries(counts)
                        .map(([name, value]) => ({ name: Number(name), value }))
                        .sort((a, b) => a.name - b.name); // Sort numerically

                    stats.data = { average: avg, min, max, chart: chartData };
                } else {
                    stats.data = { average: 0, min: 0, max: 0, chart: [] };
                }

            } else {
                // Text / Long Text
                stats.data = answers.slice(0, 10).map(a => a.answer_text || JSON.stringify(a.answer_json));
            }

            return stats;
        }));

        // 4. Raw Responses (For Cross-Tabulation Heatmap)
        // Fetch all responses with their answers to allow client-side correlation
        const rawResponsesData = await SurveyResponse.findAll({
            where: { survey_id: survey.id },
            attributes: ['id', 'latitude', 'longitude'],
            include: [{
                model: SurveyAnswer,
                as: 'answers', // Ensure this alias matches your model association
                attributes: ['question_id', 'answer_text', 'answer_json']
            }]
        });

        res.status(200).json({
            survey: {
                title: survey.title,
                unique_id: survey.unique_id
            },
            totalResponses,
            locations: validLocations,
            questions: analytics,
            rawResponses: rawResponsesData
        });

    } catch (error) {
        console.error("Get Analytics Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create Survey
surveyController.createSurvey = async (req, res) => {
    try {
        const { title, description, location, questions, status } = req.body;
        const user_id = req.user ? req.user.id : null; // Assuming auth middleware attaches user

        if (!title) {
            return res.status(400).json({ message: "Survey title is required" });
        }

        // Use a temporary unique_id initially, we will update it to ID
        const temp_unique_id = uuidv4();

        const survey = await Survey.create({
            unique_id: temp_unique_id,
            title,
            description,
            user_id,
            division_id: location?.division,
            district_id: location?.district,
            upazila_id: location?.upazila,
            union_id: location?.union,
            status: status !== undefined ? status : 1, // Default to 1 (Published) if not specified, or allow 0
            is_geo_location_required: req.body.is_geo_location_required ? 1 : 0,
            bottom_note: req.body.bottom_note
        });

        // UPDATE unique_id to be the database ID (Short URL support)
        await survey.update({ unique_id: survey.id.toString() });

        if (questions && questions.length > 0) {
            const questionsData = questions.map(q => ({
                survey_id: survey.id,
                question: q.text || q.question, // Handle both 'text' (frontend) and 'question' (backend) naming
                type: q.type,
                required: q.required,
                options: q.options,
                validation: q.validation
            }));

            await SurveyQuestion.bulkCreate(questionsData);
        }

        // Fetch complete survey with questions
        const createdSurvey = await Survey.findOne({
            where: { id: survey.id },
            include: [{ model: SurveyQuestion, as: 'questions' }]
        });

        res.status(201).json(createdSurvey);

    } catch (error) {
        console.error("Create Survey Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get User's Surveys
surveyController.getUserSurveys = async (req, res) => {
    try {
        const user_id = req.user ? req.user.id : null;

        // If no user_id (dev mode without auth?), you might want to return all or none. 
        // For now assuming we handle authorized requests.
        // const whereClause = user_id ? { user_id } : {};

        const surveys = await Survey.findAll({
            // where: { user_id },
            order: [['createdAt', 'DESC']],
            include: [
                { model: SurveyQuestion, as: 'questions' },
                { model: SurveyResponse, as: 'responses' }, // Include responses for count
                { model: require('../models').Division, as: 'division' },
                { model: require('../models').District, as: 'district' },
                { model: require('../models').Upazilla, as: 'upazila' },
                { model: require('../models').Union, as: 'union' }
            ]
        });

        res.status(200).json(surveys);
    } catch (error) {
        console.error("Get Surveys Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Public Survey View
surveyController.getPublicSurvey = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        const survey = await Survey.findOne({
            where: uniqueId.length > 5 ? { unique_id: uniqueId } : { id: uniqueId },
            include: [{ model: SurveyQuestion, as: 'questions' }]
        });

        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // Check if survey is published
        if (survey.status === 0) {
            return res.status(403).json({ message: "This survey is currently not available." });
        }

        res.status(200).json(survey);
    } catch (error) {
        console.error("Get Public Survey Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Survey Details (Protected/Owner view - ignores status)
surveyController.getSurveyDetails = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        const survey = await Survey.findOne({
            where: uniqueId.length > 5 ? { unique_id: uniqueId } : { id: uniqueId },
            include: [{ model: SurveyQuestion, as: 'questions' }]
        });

        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        res.status(200).json(survey);
    } catch (error) {
        console.error("Get Survey Details Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// AI Generate Survey
surveyController.generateSurvey = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "Server configuration error: GROQ_API_KEY missing" });
        }

        const groq = new Groq({ apiKey });

        const systemInstruction = `
        You are an expert survey creator. 
        Create a survey based on the user's prompt. 
        Return ONLY a valid JSON object. Do not wrap it in markdown code blocks. 
        The JSON must follow this structure:
        {
            "title": "String",
            "description": "String",
            "questions": [
                {
                    "text": "String",
                    "type": "text | long_text | number | multiple_choice | checkbox | date",
                    "required": boolean,
                    "options": ["Option 1", "Option 2"] (Required for multiple_choice [Single Choice Radio] and checkbox [Multiple Choice Checkbox], otherwise empty array)
                }
            ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: `Create a survey for: ${prompt}` }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            reasoning_effort: "medium",
            stream: true,
            stop: null,
            response_format: { type: "json_object" }
        });

        let generatedText = "";
        for await (const chunk of completion) {
            generatedText += chunk.choices[0]?.delta?.content || "";
        }

        // Cleanup potential markdown formatting
        const jsonString = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        const surveyData = JSON.parse(jsonString);

        res.status(200).json(surveyData);

    } catch (error) {
        console.error("AI Generation Error:", error);

        if (error instanceof Groq.APIError) {
            return res.status(error.status || 500).json({
                message: error.message || "Groq API Error",
                code: error.code
            });
        }

        res.status(500).json({
            message: "Failed to generate survey",
            details: error.message
        });
    }
};

module.exports = surveyController;
