const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorresponse");
const db = require('../models/index');
const { User, Role, UserRole } = db;
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Helper to get candidate role
const getCandidateRole = async () => {
    return await Role.findOne({ where: { name: 'candidate' } });
};

// @desc    Get all candidates (Admin)
// @route   GET /api/candidates
// @access  Protected (Admin)
exports.getAllCandidates = asyncHandler(async (req, res, next) => {
    const candidateRole = await getCandidateRole();
    if (!candidateRole) {
        return next(new ErrorResponse('Candidate role not found', 404));
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

    const { count, rows } = await User.findAndCountAll({
        include: [{
            model: Role,
            as: 'roles',
            where: { id: candidateRole.id },
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }],
        limit: perPage,
        offset: offset,
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count,
        page,
        pages: Math.ceil(count / perPage),
        data: rows
    });
});

// @desc    Get candidate by ID (Admin)
// @route   GET /api/candidates/:id
// @access  Protected (Admin)
exports.getCandidateById = asyncHandler(async (req, res, next) => {
    const candidate = await User.findByPk(req.params.id, {
        include: [{
            model: Role,
            as: 'roles',
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }]
    });

    if (!candidate) {
        return next(new ErrorResponse('Candidate not found', 404));
    }

    res.status(200).json({
        success: true,
        data: candidate
    });
});

// @desc    Create candidate (Admin)
// @route   POST /api/candidates
// @access  Protected (Admin)
exports.createCandidate = asyncHandler(async (req, res, next) => {
    const { email, password, msisdn, ...otherFields } = req.body;

    // Check existing
    if (email) {
        const isExist = await User.findOne({ where: { email } });
        if (isExist) return next(new ErrorResponse('User with this email already exists', 400));
    }
    if (msisdn) {
        const isExistMsisdn = await User.findOne({ where: { msisdn } });
        if (isExistMsisdn) return next(new ErrorResponse('User with this phone already exists', 400));
    }

    const candidateRole = await getCandidateRole();
    if (!candidateRole) return next(new ErrorResponse('Candidate role not found in DB', 404));

    const userData = {
        email,
        password,
        msisdn,
        isActive: 1,
        createdBy: req.user.id,
        ...otherFields
    };

    // Parse JSON fields if they are sent as strings
    if (typeof req.body.videos === 'string') {
        try { userData.videos = JSON.parse(req.body.videos); } catch (e) { }
    }
    if (typeof req.body.gallery === 'string') {
        try { userData.gallery = JSON.parse(req.body.gallery); } catch (e) { }
    } else if (!req.body.gallery) {
        userData.gallery = [];
    }

    // Handle uploaded files
    if (req.files) {
        if (req.files['photo']) {
            userData.photo = req.files['photo'][0].path.replace(/\\/g, "/");
        }
        if (req.files['gallery_images']) {
            const uploadedGallery = req.files['gallery_images'].map(f => f.path.replace(/\\/g, "/"));
            userData.gallery = [...(userData.gallery || []), ...uploadedGallery];
        }
    }

    const user = await User.create(userData);

    // Assign Role
    await UserRole.create({
        user_id: user.id,
        role_id: candidateRole.id
    });

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc    Update candidate (Admin)
// @route   PUT /api/candidates/:id
// @access  Protected (Admin)
exports.updateCandidate = asyncHandler(async (req, res, next) => {
    let candidate = await User.findByPk(req.params.id);
    if (!candidate) return next(new ErrorResponse('Candidate not found', 404));

    const { email, password, msisdn, ...otherFields } = req.body;
    
    // Parse JSON fields
    if (typeof req.body.videos === 'string') {
        try { otherFields.videos = JSON.parse(req.body.videos); } catch (e) { }
    }
    if (typeof req.body.gallery === 'string') {
        try { otherFields.gallery = JSON.parse(req.body.gallery); } catch (e) { }
    }

    // Handle files
    if (req.files) {
        if (req.files['photo']) {
            if (candidate.photo) {
                const oldPath = path.join(path.resolve(), candidate.photo);
                fs.unlink(oldPath, () => {});
            }
            otherFields.photo = req.files['photo'][0].path.replace(/\\/g, "/");
        }
        if (req.files['gallery_images']) {
            const uploadedGallery = req.files['gallery_images'].map(f => f.path.replace(/\\/g, "/"));
            otherFields.gallery = [...(candidate.gallery || []), ...uploadedGallery];
        }
    }

    // Update password if provided
    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        otherFields.password = await bcrypt.hash(password, salt);
    }

    if (email) otherFields.email = email;
    if (msisdn) otherFields.msisdn = msisdn;

    // Use update method directly to bypass the beforeUpdate hook for password if we already hashed it,
    // wait, the hook hashes if 'password' is changed. We shouldn't hash it twice!
    // Since hook checks `user.changed('password')`, we just set it as plain text and let hook hash it.
    if (password && password.trim() !== '') {
        candidate.password = password; // Hook will hash it
        delete otherFields.password;
    }

    candidate = await candidate.update(otherFields);

    res.status(200).json({
        success: true,
        data: candidate
    });
});

// @desc    Delete candidate (Admin)
// @route   DELETE /api/candidates/:id
// @access  Protected (Admin)
exports.deleteCandidate = asyncHandler(async (req, res, next) => {
    const candidate = await User.findByPk(req.params.id);
    if (!candidate) return next(new ErrorResponse('Candidate not found', 404));

    if (candidate.photo) {
        fs.unlink(path.join(path.resolve(), candidate.photo), () => {});
    }

    await candidate.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get current candidate profile (Portal)
// @route   GET /api/candidates/profile
// @access  Protected (candidate only)
exports.getProfile = asyncHandler(async (req, res, next) => {
    const profile = await User.findByPk(req.user.id);
    res.status(200).json({
        success: true,
        data: profile
    });
});

// @desc    Update current candidate profile (Portal)
// @route   PUT /api/candidates/profile
// @access  Protected (candidate only)
exports.updateProfile = asyncHandler(async (req, res, next) => {
    let profile = await User.findByPk(req.user.id);
    if (!profile) return next(new ErrorResponse('Profile not found', 404));

    const fieldsToUpdate = {};
    const allowedFields = [
        'biography', 'election_manifesto', 'videos', 'educational_background', 
        'professional_experience', 'achievements', 'vision_mission', 'contact_information'
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            if (field === 'videos' && typeof req.body.videos === 'string') {
                try { fieldsToUpdate.videos = JSON.parse(req.body.videos); } catch(e){}
            } else {
                fieldsToUpdate[field] = req.body[field];
            }
        }
    });

    if (req.files) {
        if (req.files['photo']) {
            if (profile.photo) fs.unlink(path.join(path.resolve(), profile.photo), () => {});
            fieldsToUpdate.photo = req.files['photo'][0].path.replace(/\\/g, "/");
        }
        // Candidate portal could also upload gallery images
        if (req.files['gallery_images']) {
            const uploadedGallery = req.files['gallery_images'].map(f => f.path.replace(/\\/g, "/"));
            fieldsToUpdate.gallery = [...(profile.gallery || []), ...uploadedGallery];
        }
    }

    profile = await profile.update(fieldsToUpdate);

    res.status(200).json({
        success: true,
        data: profile
    });
});
