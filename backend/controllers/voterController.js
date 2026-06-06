const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Voter, Division, District, Upazilla, Union } = db;
const { Op } = require('sequelize');

//@route    POST /api/voters
//@desc     Create a new voter
//@access   Protected
const createVoter = asyncHandler(async (req, res, next) => {
    const {
        name,
        age,
        gender,
        nid,
        phone,
        profession,
        division_id,
        district_id,
        upazilla_id,
        union_id,
        ward,
        voter_center,
        category
    } = req.body;

    // Check if voter with same NID already exists
    const existingVoter = await Voter.findOne({ where: { nid } });
    if (existingVoter) {
        return next(new ErrorResponse('A voter with this NID already exists!', 400));
    }

    const voter = await Voter.create({
        name,
        age,
        gender,
        nid,
        phone: phone || null,
        profession: profession || null,
        division_id,
        district_id,
        upazilla_id,
        union_id,
        ward,
        voter_center,
        category: category || null
    });

    return res.status(201).json({
        success: true,
        msg: "Voter created successfully!",
        data: voter
    });
});

//@route    GET /api/voters
//@desc     Get all voters with optional filters
//@access   Protected
const getAllVoters = asyncHandler(async (req, res, next) => {
    const {
        division_id,
        district_id,
        upazilla_id,
        union_id,
        search,
        organization,
        profession,
        category,
        page = 1,
        limit = 20
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Filter by location
    if (division_id) {
        whereClause.division_id = division_id;
    }
    if (district_id) {
        whereClause.district_id = district_id;
    }
    if (upazilla_id) {
        whereClause.upazilla_id = upazilla_id;
    }
    if (union_id) {
        whereClause.union_id = union_id;
    }
    if (organization) {
        whereClause.organization = { [Op.like]: `%${organization}%` };
    }
    if (profession) {
        whereClause.profession = { [Op.like]: `%${profession}%` };
    }
    if (category) {
        whereClause.category = category;
    }

    // Search functionality
    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { nid: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
        ];
    }

    // Pagination
    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const offset = (currentPage - 1) * pageLimit;

    // Get count of filtered voters
    const { count, rows: voters } = await Voter.findAndCountAll({
        where: whereClause,
        include: [
            { model: Division, as: 'division' },
            { model: District, as: 'district' },
            { model: Upazilla, as: 'upazilla' },
            { model: Union, as: 'union' }
        ],
        limit: pageLimit,
        offset: offset,
        order: [['created_at', 'DESC']]
    });

    // Get total count of all voters (unfiltered)
    const totalVoters = await Voter.count();

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / pageLimit);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
        success: true,
        message: 'Voters fetched successfully!',
        data: voters,
        pagination: {
            currentPage,
            limit: pageLimit,
            totalPages,
            totalFiltered: count,
            totalVoters,
            hasNextPage,
            hasPrevPage,
            count: voters.length
        }
    });
});

//@route    GET /api/voters/:id
//@desc     Get a single voter by ID
//@access   Protected
const getVoterById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const voter = await Voter.findByPk(id, {
        include: [
            { model: Division, as: 'division' },
            { model: District, as: 'district' },
            { model: Upazilla, as: 'upazila' },
            { model: Union, as: 'union' }
        ]
    });

    if (!voter) {
        return next(new ErrorResponse('Voter not found!', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Voter fetched successfully!',
        data: voter
    });
});

//@route    PATCH /api/voters/:id
//@desc     Update a voter
//@access   Protected
const updateVoter = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            age,
            gender,
            nid,
            phone,
            profession,
            division_id,
            district_id,
            upazilla_id,
            union_id,
            ward,
            voter_center,
            category
        } = req.body;

        const voter = await Voter.findByPk(id);

        if (!voter) {
            return next(new ErrorResponse('Voter not found!', 404));
        }

        const updatedData = {};
        let isChanged = false;

        if (name?.trim() && voter.name !== name.trim()) {
            updatedData.name = name.trim();
            isChanged = true;
        }

        if (age && voter.age != age) { // Use loose equality for safety with string/number comparison
            updatedData.age = age;
            isChanged = true;
        }

        if (nid && voter.nid !== nid) {
            // Check uniqueness if NID is changing
            const existingVoter = await Voter.findOne({ where: { nid } });
            if (existingVoter) {
                return next(new ErrorResponse('A voter with this NID already exists!', 400));
            }
            updatedData.nid = nid;
            isChanged = true;
        }

        if (gender && voter.gender !== gender) {
            updatedData.gender = gender;
            isChanged = true;
        }

        if (phone !== undefined && voter.phone !== phone) {
            updatedData.phone = phone;
            isChanged = true;
        }

        if (profession !== undefined && voter.profession !== profession) {
            updatedData.profession = profession;
            isChanged = true;
        }

        if (division_id && voter.division_id !== division_id) {
            updatedData.division_id = division_id;
            isChanged = true;
        }

        if (district_id && voter.district_id !== district_id) {
            updatedData.district_id = district_id;
            isChanged = true;
        }

        if (upazilla_id && voter.upazilla_id !== upazilla_id) {
            updatedData.upazilla_id = upazilla_id;
            isChanged = true;
        }

        if (union_id && voter.union_id !== union_id) {
            updatedData.union_id = union_id;
            isChanged = true;
        }

        if (ward && voter.ward !== ward) {
            updatedData.ward = ward;
            isChanged = true;
        }

        if (voter_center && voter.voter_center !== voter_center) {
            updatedData.voter_center = voter_center;
            isChanged = true;
        }

        if (category !== undefined && voter.category !== category) {
            updatedData.category = category;
            isChanged = true;
        }

        if (!isChanged) {
            return res.status(200).json({
                success: true,
                msg: "No changes detected!",
                data: voter
            });
        }

        await voter.update(updatedData);

        return res.status(200).json({
            success: true,
            msg: "Voter updated successfully!",
            data: voter
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 500));
    }
});

//@route    DELETE /api/voters/:id
//@desc     Delete a voter permanently
//@access   Protected
const deleteVoter = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const voter = await Voter.findByPk(id);

    if (!voter) {
        return next(new ErrorResponse('Voter not found!', 404));
    }

    await voter.destroy();

    return res.status(200).json({
        success: true,
        msg: `Voter ${voter.name} deleted successfully!`
    });
});

//@route    GET /api/voters/stats
//@desc     Get voter statistics
//@access   Protected
const getVoterStats = asyncHandler(async (req, res, next) => {
    const totalVoters = await Voter.count();

    const genderStats = await Voter.findAll({
        attributes: [
            'gender',
            [db.sequelize.fn('COUNT', db.sequelize.col('gender')), 'count']
        ],
        group: ['gender']
    });

    const ageGroups = await Voter.findAll({
        attributes: [
            [db.sequelize.literal(`CASE 
                WHEN age BETWEEN 18 AND 25 THEN '18-25'
                WHEN age BETWEEN 26 AND 35 THEN '26-35'
                WHEN age BETWEEN 36 AND 50 THEN '36-50'
                WHEN age > 50 THEN '50+'
                ELSE 'Unknown'
            END`), 'age_group'],
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['age_group']
    });

    res.status(200).json({
        success: true,
        message: 'Voter statistics fetched successfully!',
        data: {
            total: totalVoters,
            byGender: genderStats,
            byAgeGroup: ageGroups
        }
    });
});

module.exports = {
    createVoter,
    getAllVoters,
    getVoterById,
    updateVoter,
    deleteVoter,
    getVoterStats
};
