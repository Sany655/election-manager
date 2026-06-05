const express = require('express');
const router = express.Router();
const commandCenterController = require('../controllers/commandCenterController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Agents
router.post('/agents', protect, checkPermission('manage-command-center'), commandCenterController.createAgent);
router.get('/agents', protect, checkPermission('view-command-center'), commandCenterController.getAgents);
router.get('/stats', protect, checkPermission('view-command-center'), commandCenterController.getStats);

// Assignments
router.post('/assign', protect, checkPermission('manage-command-center'), commandCenterController.assignAgentToBooth);

// Incidents
router.post('/incidents', protect, checkPermission('report-incident'), commandCenterController.reportIncident);
router.get('/incidents', protect, checkPermission('view-command-center'), commandCenterController.getIncidents);
router.get('/map', protect, checkPermission('view-command-center'), commandCenterController.getMapData);

// Attendance (Polling Day)
router.post('/attendance', protect, checkPermission('manage-command-center'), commandCenterController.markAttendance);

router.put('/incidents/:id/resolve', protect, checkPermission('manage-command-center'), commandCenterController.resolveIncident);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/incidents';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload Route
router.post('/upload', protect, checkPermission('report-incident'), upload.array('media', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        // Return relative URLs
        const urls = req.files.map(file => `/uploads/incidents/${file.filename}`);
        res.json({ success: true, urls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
