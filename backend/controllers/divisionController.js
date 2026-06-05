const { Division, District } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');

// @desc    Get all divisions
// @route   GET /api/divisions
// @access  Public/Protected
exports.getDivisions = asyncHandler(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Division.findAndCountAll({
            limit,
            offset,
            order: [['id', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count,
            page,
            pages: Math.ceil(count / limit),
            data: rows
        });
    } catch (error) {
        console.log(error)
    }
});

// @desc    Create a division
// @route   POST /api/divisions
// @access  Protected
exports.createDivision = asyncHandler(async (req, res, next) => {
    const division = await Division.create(req.body);
    res.status(201).json({
        success: true,
        data: division
    });
});

// @desc    Update a division
// @route   PATCH /api/divisions/:id
// @access  Protected
exports.updateDivision = asyncHandler(async (req, res, next) => {
    let division = await Division.findByPk(req.params.id);

    if (!division) {
        return next(new ErrorResponse(`Division not found with id of ${req.params.id}`, 404));
    }

    division = await division.update(req.body);

    res.status(200).json({
        success: true,
        data: division
    });
});

// @desc    Delete a division
// @route   DELETE /api/divisions/:id
// @access  Protected
exports.deleteDivision = asyncHandler(async (req, res, next) => {
    const division = await Division.findByPk(req.params.id);

    if (!division) {
        return next(new ErrorResponse(`Division not found with id of ${req.params.id}`, 404));
    }

    // Check for dependent districts
    const dependentDistricts = await District.count({
        where: { division_id: req.params.id }
    });

    if (dependentDistricts > 0) {
        return next(new ErrorResponse(`Cannot delete division. It has ${dependentDistricts} dependent districts.`, 400));
    }

    await division.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
