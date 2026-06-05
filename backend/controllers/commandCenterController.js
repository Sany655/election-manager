const { AgentAssignment, IncidentReport, User, VoteCentre, sequelize, Role, UserRole, UserPersonalDetails } = require('../models');
const { validationResult } = require('express-validator');
const whatsappService = require('../services/whatsappService');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');


// --- Agent Management ---

exports.createAgent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { full_name, phone, nid, photo_url, home_geo_location, email, assigned_union_id } = req.body;

        // 1. Check if User Exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email || '' }, // Handle optional email
                    { msisdn: phone }
                ]
            }
        });

        if (existingUser) {
            await transaction.rollback();
            return res.status(409).json({ success: false, message: 'User with this email or phone already exists.' });
        }

        // 2. Generate Unique Agent ID (Format: AG-TIMESTAMP-RANDOM)
        const agent_unique_id = `AG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

        // 3. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt); // Default password

        const newUser = await User.create({
            name: full_name,
            msisdn: phone,
            email: email,
            password: hashedPassword,
            union_id: assigned_union_id,
            avatar: photo_url,
            isActive: true,
            employee_id: agent_unique_id // Storing AG-ID here
        }, { transaction });

        // 4. Create User Personal Details (NID, Location)
        await UserPersonalDetails.create({
            user_id: newUser.id,
            identification_type: 'nid',
            identification_no: nid,
            home_geo_location: home_geo_location // Assuming GeoJSON or similar format passed
        }, { transaction });

        // 5. Assign 'agent' Role
        let agentRole = await Role.findOne({ where: { name: 'agent' } });

        if (!agentRole) {
            agentRole = await Role.create({ name: 'agent' }, { transaction });
        }

        await UserRole.create({
            user_id: newUser.id,
            role_id: agentRole.id
        }, { transaction });


        await transaction.commit();

        // Fetch complete agent data to return
        const agentData = await User.findByPk(newUser.id, {
            include: [{ model: UserPersonalDetails, as: 'personalDetails' }]
        });

        res.status(201).json({ success: true, data: agentData });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAgents = async (req, res) => {
    try {
        // Find users with 'agent' role
        const agents = await User.findAll({
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { name: 'agent' },
                    attributes: [] // Don't return role details, just filter
                },
                {
                    model: UserPersonalDetails,
                    as: 'personalDetails'
                },
                {
                    model: AgentAssignment, // User hasMany AgentAssignment (need to ensure this association exists in User model!)
                    as: 'assignments' // We might need to check/add this association aliases in User model. 
                    // Since we removed 'AgentProfile', we should treat User as the 'agent'.
                    // In AgentAssignment model we defined belongsTo User. 
                    // User model needs hasMany AgentAssignment.
                }
            ]
        });

        // Note: Check User.js for 'assignments' alias. It has 'attendances', but likely not 'agent_assignments'.
        // We might need to add `User.hasMany(models.AgentAssignment, { foreignKey: 'agent_id', as: 'assignments' })` in User model logic.
        // Assuming it exists or we add it dynamically if possible, or we ignore for now and update User model separately.

        res.status(200).json({ success: true, data: agents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Assignment Management ---

exports.assignAgentToBooth = async (req, res) => {
    try {
        const { agent_id, agent_ids, booth_id, booth_number, shift_date, expected_start_time } = req.body;

        const idsToAssign = agent_ids || (agent_id ? [agent_id] : []);

        if (idsToAssign.length === 0) {
            return res.status(400).json({ success: false, message: 'No agents provided for assignment' });
        }

        // --- Enforce Rules (FR-02) ---
        // 1. One Agent -> One Booth
        const existingAgentAssignments = await AgentAssignment.findAll({
            where: {
                agent_id: idsToAssign,
                shift_date: shift_date,
                status: ['ASSIGNED', 'ON_DUTY']
            }
        });

        if (existingAgentAssignments.length > 0) {
            const occupiedIds = existingAgentAssignments.map(a => a.agent_id);
            return res.status(409).json({
                success: false,
                message: `Agents already assigned on this date: ${occupiedIds.join(', ')}`
            });
        }

        // 2. Booth cannot have multiple agents? 
        if (booth_number) {
            const existingBoothAssignment = await AgentAssignment.findOne({
                where: {
                    booth_id,
                    booth_number: booth_number.toString(),
                    shift_date,
                    status: ['ASSIGNED', 'ON_DUTY']
                }
            });

            if (existingBoothAssignment) {
                return res.status(409).json({
                    success: false,
                    message: `Booth ${booth_number} at this center is already assigned.`
                });
            }
        }

        const assignmentsData = idsToAssign.map(id => ({
            agent_id: id,
            booth_id,
            booth_number: booth_number ? booth_number.toString() : null,
            shift_date,
            expected_start_time,
            status: 'ASSIGNED'
        }));

        const assignments = await AgentAssignment.bulkCreate(assignmentsData);

        res.status(201).json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Incident Management ---

exports.reportIncident = async (req, res) => {
    try {
        const { booth_id, type, severity, description, media_urls } = req.body;

        // Use authenticated user ID if available, otherwise fallback to body's agent_id (for admin reporting on behalf)
        // ideally agents report for themselves
        const agent_id = req.user ? req.user.id : req.body.agent_id;

        if (!agent_id) {
            return res.status(400).json({ success: false, message: 'Agent ID is required' });
        }

        // Ensure media_urls is an array
        let processedMediaUrls = media_urls;
        if (typeof media_urls === 'string') {
            try {
                processedMediaUrls = JSON.parse(media_urls);
            } catch (e) {
                processedMediaUrls = [media_urls];
            }
        }
        if (!Array.isArray(processedMediaUrls)) {
            processedMediaUrls = []; // Default to empty array if invalid
        }

        const incident = await IncidentReport.create({
            agent_id,
            booth_id,
            type,
            severity,
            description,
            media_urls: processedMediaUrls
        });

        // Optional: Trigger socket event
        // if (global.io) global.io.emit('new_incident', incident);

        res.status(201).json({ success: true, data: incident });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getIncidents = async (req, res) => {
    try {
        const incidents = await IncidentReport.findAll({
            include: [
                { model: User, as: 'reporter', attributes: ['id', 'name', 'msisdn'] },
                { model: VoteCentre, as: 'booth' }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ success: true, data: incidents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.resolveIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution_log } = req.body;

        const incident = await IncidentReport.findByPk(id);
        if (!incident) return res.status(404).json({ message: 'Incident not found' });

        incident.status = 'RESOLVED';
        incident.resolution_log = resolution_log;
        await incident.save();

        res.status(200).json({ success: true, data: incident });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// --- Polling Day Operations ---

exports.markAttendance = async (req, res) => {
    try {
        const { agent_unique_id, latitude, longitude, timestamp } = req.body;

        // 1. Find the Agent (User) by employee_id (which stores the agent_unique_id)
        const agent = await User.findOne({ where: { employee_id: agent_unique_id } });
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const today = new Date().toISOString().split('T')[0];

        const assignment = await AgentAssignment.findOne({
            where: {
                agent_id: agent.id,
                shift_date: today,
                status: ['ASSIGNED', 'LATE']
            },
            include: [{ model: VoteCentre, as: 'booth' }]
        });

        if (!assignment) {
            return res.status(400).json({ success: false, message: 'No active assignment found for today or already checked in.' });
        }

        // 2. Verify Geo-Fence
        const centerLat = assignment.booth.latitude;
        const centerLng = assignment.booth.longitude;

        if (!centerLat || !centerLng) {
            // Logic to allowed if no geo?
        } else {
            const toRad = x => x * Math.PI / 180;
            const R = 6371e3; // metres
            const φ1 = toRad(centerLat);
            const φ2 = toRad(latitude);
            const Δφ = toRad(latitude - centerLat);
            const Δλ = toRad(longitude - centerLng);

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;

            const ALLOWED_RADIUS = 200;

            if (d > ALLOWED_RADIUS) {
                return res.status(400).json({
                    success: false,
                    message: `You are ${Math.round(d)}m away from the center. You must be within ${ALLOWED_RADIUS}m to check in.`
                });
            }
        }

        assignment.status = 'ON_DUTY';
        assignment.actual_check_in = new Date();
        assignment.check_in_location = { type: 'Point', coordinates: [latitude, longitude] };

        await assignment.save();

        res.status(200).json({ success: true, message: 'Check-in successful', data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMapData = async (req, res) => {
    try {
        const { union_id } = req.query;
        const where = {};
        if (union_id) where.union_id = union_id;

        const centers = await VoteCentre.findAll({
            where,
            attributes: ['id', 'name', 'latitude', 'longitude', 'risk_level', 'union_id', 'upozilla_name'],
            include: [{
                model: AgentAssignment,
                as: 'assignments',
                required: false,
                where: {
                    // shift_date: new Date().toISOString().split('T')[0] 
                },
                include: [{
                    model: User,
                    as: 'agent',
                    attributes: ['id', 'name', 'msisdn', 'avatar']
                }]
            }]
        });

        res.status(200).json({ success: true, data: centers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        // Count users with agent role
        const totalAgents = await User.count({
            include: [{
                model: Role,
                as: 'roles',
                where: { name: 'agent' }
            }]
        });

        const agentStats = await AgentAssignment.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status'],
            raw: true
        });

        const activeAgents = agentStats.find(s => s.status === 'ON_DUTY')?.count || 0;
        const lateAgents = agentStats.find(s => s.status === 'LATE')?.count || 0;
        const absentAgents = agentStats.find(s => s.status === 'ABSENT')?.count || 0;

        const totalIncidents = await IncidentReport.count();
        const resolvedIncidents = await IncidentReport.count({ where: { status: 'RESOLVED' } });

        const riskStats = await VoteCentre.findAll({
            attributes: ['risk_level', [sequelize.fn('COUNT', sequelize.col('risk_level')), 'count']],
            group: ['risk_level'],
            raw: true
        });

        const highRiskCenters = riskStats.find(s => s.risk_level === 'HIGH')?.count || 0;

        res.status(200).json({
            success: true,
            data: {
                totalAgents,
                activeAgents,
                lateAgents,
                absentAgents,
                totalIncidents,
                resolvedIncidents,
                highRiskCenters,
                riskStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
