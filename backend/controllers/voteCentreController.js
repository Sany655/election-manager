const { VoteCentre } = require('../models');

// @desc    Get all vote centres
// @route   GET /api/vote-centres
// @access  Public/Private
const getVoteCentres = async (req, res) => {
    try {
        const { union_id } = req.query;
        const where = {};
        if (union_id) {
            where.union_id = union_id;
        }
        const voteCentres = await VoteCentre.findAll({
            where,
            order: [['id', 'DESC']]
        });
        res.status(200).json(voteCentres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a vote centre
// @route   POST /api/vote-centres
// @access  Private
const createVoteCentre = async (req, res) => {
    try {
        const voteCentre = await VoteCentre.create(req.body);
        res.status(201).json(voteCentre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a vote centre
// @route   PUT /api/vote-centres/:id
// @access  Private
const updateVoteCentre = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await VoteCentre.update(req.body, {
            where: { id }
        });

        if (updated) {
            const updatedVoteCentre = await VoteCentre.findOne({ where: { id } });
            res.status(200).json(updatedVoteCentre);
        } else {
            res.status(404).json({ message: 'Vote Centre not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a vote centre
// @route   DELETE /api/vote-centres/:id
// @access  Private
const deleteVoteCentre = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await VoteCentre.destroy({
            where: { id }
        });

        if (deleted) {
            res.status(200).json({ message: 'Vote Centre deleted' });
        } else {
            res.status(404).json({ message: 'Vote Centre not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getVoteCentres,
    createVoteCentre,
    updateVoteCentre,
    deleteVoteCentre
};
