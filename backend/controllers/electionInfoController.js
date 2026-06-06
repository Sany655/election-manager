const { ElectionInfo } = require('../models');

// Get current election info
const getElectionInfo = async (req, res) => {
    try {
        const info = await ElectionInfo.findOne({
            order: [['createdAt', 'DESC']]
        });
        
        if (!info) {
            return res.json({ nominationDate: null, electionDate: null, status: 'Not Set' });
        }
        
        res.json(info);
    } catch (error) {
        console.error('Error fetching election info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update or Create election info
const updateElectionInfo = async (req, res) => {
    try {
        const { nominationDate, electionDate, status } = req.body;
        
        let info = await ElectionInfo.findOne({
            order: [['createdAt', 'DESC']]
        });
        
        if (info) {
            await info.update({
                nominationDate: nominationDate || info.nominationDate,
                electionDate: electionDate || info.electionDate,
                status: status || info.status
            });
        } else {
            info = await ElectionInfo.create({
                nominationDate,
                electionDate,
                status: status || 'Active'
            });
        }

        res.json(info);
    } catch (error) {
        console.error('Error updating election info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getElectionInfo,
    updateElectionInfo
};
