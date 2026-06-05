const axios = require('axios');
const { SocialAnalytics } = require('../models');
const fs = require('fs');

exports.analyzePost = async (req, res) => {
    try {
        console.log('analyzePost called with body:', req.body);
        const { url, apify_key, force_update } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Post URL is required' });
        }

        // 1. Check if analysis already exists in the database
        let existingAnalysis = await SocialAnalytics.findOne({ where: { post_url: url } });

        if (existingAnalysis && !force_update) {
            console.log(`Found existing analysis for URL: ${url}. Waiting for user decision...`);

            // Parse existing raw_data to check for hashtags/top_words
            const safeRawData = existingAnalysis.raw_data || {};

            // Return specific flag indicating existence
            return res.json({
                existing: true,
                id: existingAnalysis.id,
                post_time: existingAnalysis.createdAt,
                post_data: {
                    content: existingAnalysis.content,
                    likes: existingAnalysis.likes,
                    shares: existingAnalysis.shares,
                    comments: existingAnalysis.comments_count,
                    timestamp: existingAnalysis.post_time,
                    raw_data: safeRawData.post_raw_data || {}
                },
                comments_data: typeof existingAnalysis.comments === 'string' ? JSON.parse(existingAnalysis.comments) : (existingAnalysis.comments || []),
                hashtags: safeRawData.hashtags || [],
                top_words: safeRawData.top_words || []
            });
        }

        if (!apify_key) {
            return res.status(400).json({ error: 'Apify Key is required for new analysis' });
        }

        const analyticsServiceUrl = process.env.SOCIAL_ANALYTICS_URL;
        if (!analyticsServiceUrl) {
            console.error('SOCIAL_ANALYTICS_URL is not defined in .env');
            return res.status(500).json({ error: 'Server configuration error: SOCIAL_ANALYTICS_URL missing' });
        }

        console.log(`Forwarding request to social analytics service for URL: ${url} (Service: ${analyticsServiceUrl})`);

        // 2. Call external API
        const targetUrl = `${analyticsServiceUrl}/analyze`;
        let response;
        try {
            response = await axios.post(targetUrl, {
                url: url,
                apify_key: apify_key
            }, {
                headers: { 'Content-Type': 'application/json', 'x-api-key': 'ImPro' }
            });
        } catch (axiosError) {
            console.error('Axios Error calling Analytics Service:', axiosError.message);
            if (axiosError.code === 'ECONNREFUSED') {
                return res.status(503).json({ error: 'Social Analytics Service is unreachable. Is the Python server running?' });
            }
            if (axiosError.response) {
                return res.status(axiosError.response.status).json({
                    error: 'Analytics Service Error',
                    details: axiosError.response.data
                });
            }
            throw axiosError;
        }

        const rawData = response.data;
        console.log('Service response received');

        // 3. Normalize Data Structure based on User's provided structure
        const postData = rawData.post_data || rawData.post || {};
        const commentsList = rawData.comments_data || rawData.comments || [];
        const hashtags = rawData.hashtags || [];
        const topWords = rawData.top_words || [];

        // Prepare data for DB
        // We store hashtags and top_words inside the 'raw_data' JSON column to avoid schema changes
        const dbRawData = {
            hashtags: hashtags,
            top_words: topWords,
            post_raw_data: postData.raw_data || {}
        };

        let dbContent = postData.content || '';
        let dbPostTime = postData.timestamp || new Date().toISOString();
        let dbLikes = postData.likes; // Allow 0
        let dbCommentsCount = postData.comments;
        let dbShares = postData.shares;

        if (dbLikes === undefined || dbLikes === null) dbLikes = 0;
        if (dbCommentsCount === undefined || dbCommentsCount === null) dbCommentsCount = 0;
        if (dbShares === undefined || dbShares === null) dbShares = 0;

        // 4. Save (Create or Update) to Database
        let savedId;
        try {
            if (existingAnalysis) {
                // Merge Logic: Keep existing value if new value is empty/null
                // Helper to check emptiness (strings: empty, numbers: null/undefined - treating 0 as valid)
                const merge = (oldVal, newVal) => {
                    if (newVal === null || newVal === undefined) return oldVal;
                    if (typeof newVal === 'string' && newVal.trim() === '') return oldVal;
                    return newVal;
                };

                // Apply merge
                const mergedContent = merge(existingAnalysis.content, dbContent);
                const mergedLikes = merge(existingAnalysis.likes, dbLikes);
                const mergedCommentsCount = merge(existingAnalysis.comments_count, dbCommentsCount);
                const mergedShares = merge(existingAnalysis.shares, dbShares);
                const mergedPostTime = merge(existingAnalysis.post_time, dbPostTime);

                // For complex objects/arrays like raw_data or comments, we might generally prefer the new one unless it's empty
                // But specifically for raw_data items:
                const safeCurrentRaw = existingAnalysis.raw_data || {};
                const mergedHashtags = (hashtags && hashtags.length > 0) ? hashtags : (safeCurrentRaw.hashtags || []);
                const mergedTopWords = (topWords && topWords.length > 0) ? topWords : (safeCurrentRaw.top_words || []);
                const mergedPostRawData = (postData.raw_data && Object.keys(postData.raw_data).length > 0) ? postData.raw_data : (safeCurrentRaw.post_raw_data || {});

                const mergedRawData = {
                    hashtags: mergedHashtags,
                    top_words: mergedTopWords,
                    post_raw_data: mergedPostRawData
                };

                // Comments: if new list is empty, keep old? User didn't specify array logic explicitly but "update/replace any null/empty".
                // Usually if we re-scrape and find 0 comments, we probably want to update to 0? 
                // But if the scrape failed (all empty), we might want to keep history.
                // Assuming "null/empty" implies "missing data due to failure".
                const mergedComments = (commentsList && commentsList.length > 0) ? commentsList : existingAnalysis.comments;

                await existingAnalysis.update({
                    likes: mergedLikes,
                    comments_count: mergedCommentsCount,
                    shares: mergedShares,
                    comments: mergedComments,
                    content: mergedContent,
                    post_time: mergedPostTime,
                    raw_data: mergedRawData
                });
                savedId = existingAnalysis.id;
                console.log('Existing analysis updated with ID:', savedId);

                // Update local vars for response
                dbContent = mergedContent;
                dbLikes = mergedLikes;
                dbShares = mergedShares;
                dbCommentsCount = mergedCommentsCount;
                dbPostTime = mergedPostTime;
                // dbRawData is not fully used in response reconstruction below effectively, so we rely on individual vars

            } else {
                const newRecord = await SocialAnalytics.create({
                    post_url: url,
                    likes: dbLikes,
                    comments_count: dbCommentsCount,
                    shares: dbShares,
                    comments: commentsList,
                    content: dbContent,
                    post_time: dbPostTime,
                    raw_data: dbRawData
                });
                savedId = newRecord.id;
                console.log('New analysis created with ID:', savedId);
            }
        } catch (dbError) {
            console.error('Error saving to DB:', dbError);
            return res.status(500).json({ error: 'Database Error', details: dbError.message });
        }

        // Return exact structure
        res.json({
            post_data: {
                content: dbContent,
                likes: dbLikes,
                shares: dbShares,
                comments: dbCommentsCount,
                timestamp: dbPostTime,
                raw_data: postData.raw_data || {}
            },
            comments_data: commentsList,
            hashtags: hashtags,
            top_words: topWords,
            id: savedId,
            existing: false
        });

    } catch (error) {
        console.error('Error in analyzePost:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await SocialAnalytics.findAll({
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'post_url', 'likes', 'comments_count', 'shares', 'createdAt', 'updatedAt']
        });
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.getAnalysisById = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await SocialAnalytics.findByPk(id);

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        console.log('Analysis found:', analysis);

        // Extract extras from raw_data
        const safeRawData = JSON.parse(analysis.raw_data) || {};
        const hashtags = safeRawData.hashtags || [];
        const topWords = safeRawData.top_words || [];
        const postRawData = safeRawData.post_raw_data || {};

        const responseData = {
            post_data: {
                content: analysis.content,
                likes: analysis.likes,
                shares: analysis.shares,
                comments: analysis.comments_count,
                timestamp: analysis.post_time,
                raw_data: postRawData
            },
            comments_data: typeof analysis.comments === 'string' ? JSON.parse(analysis.comments) : (analysis.comments || []),
            hashtags: hashtags,
            top_words: topWords
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching analysis details:', error);
        res.status(500).json({ error: 'Failed to fetch analysis details' });
    }
};

exports.deleteAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await SocialAnalytics.findByPk(id);

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        await analysis.destroy();
        res.json({ message: 'Analysis deleted successfully' });
    } catch (error) {
        console.error('Error deleting analysis:', error);
        res.status(500).json({ error: 'Failed to delete analysis' });
    }
};
