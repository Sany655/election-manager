const { District, Upazilla, Division } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');

// @desc    Get all districts
// @route   GET /api/districts
// @access  Public/Protected
exports.getDistricts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await District.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']],
        include: [
            {
                model: Division,
                as: 'division',
                attributes: ['name', 'bn_name']
            }
        ]
    });

    res.status(200).json({
        success: true,
        count,
        page,
        pages: Math.ceil(count / limit),
        data: rows
    });
});

// @desc    Create a district
// @route   POST /api/districts
// @access  Protected
exports.createDistrict = asyncHandler(async (req, res, next) => {
    const district = await District.create(req.body);
    res.status(201).json({
        success: true,
        data: district
    });
});

// @desc    Update a district
// @route   PATCH /api/districts/:id
// @access  Protected
exports.updateDistrict = asyncHandler(async (req, res, next) => {
    try {
        let district = await District.findByPk(req.params.id);

        if (!district) {
            return next(new ErrorResponse(`District not found with id of ${req.params.id}`, 404));
        }

        district = await district.update(req.body);

        res.status(200).json({
            success: true,
            data: district
        });
    } catch (error) {
        console.log("Error updating district:", error);
    }
});

// @desc    Delete a district
// @route   DELETE /api/districts/:id
// @access  Protected
exports.deleteDistrict = asyncHandler(async (req, res, next) => {
    const district = await District.findByPk(req.params.id);

    if (!district) {
        return next(new ErrorResponse(`District not found with id of ${req.params.id}`, 404));
    }

    // Check for dependent upazillas
    const dependentUpazillas = await Upazilla.count({
        where: { district_id: req.params.id }
    });

    if (dependentUpazillas > 0) {
        return next(new ErrorResponse(`Cannot delete district. It has ${dependentUpazillas} dependent upazillas.`, 400));
    }

    await district.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
