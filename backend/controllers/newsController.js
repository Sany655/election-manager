const { News } = require('../models');

// Get all news
const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await News.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create news
const createNews = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const news = await News.create({
            title,
            description
        });

        res.status(201).json(news);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update news
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const news = await News.findByPk(id);
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }

        await news.update({
            title: title || news.title,
            description: description || news.description
        });

        res.json(news);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete news
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        
        const news = await News.findByPk(id);
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }

        await news.destroy();
        
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllNews,
    createNews,
    updateNews,
    deleteNews
};
