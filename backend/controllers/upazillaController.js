const { Upazilla, Union, District } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');

// @desc    Get all upazillas
// @route   GET /api/upazillas
// @access  Public/Protected
exports.getUpazillas = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Upazilla.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']],
        include: [
            {
                model: District,
                as: 'district',
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

// @desc    Create a upazilla
// @route   POST /api/upazillas
// @access  Protected
exports.createUpazilla = asyncHandler(async (req, res, next) => {
    const upazilla = await Upazilla.create(req.body);
    res.status(201).json({
        success: true,
        data: upazilla
    });
});

// @desc    Update a upazilla
// @route   PATCH /api/upazillas/:id
// @access  Protected
exports.updateUpazilla = asyncHandler(async (req, res, next) => {
    let upazilla = await Upazilla.findByPk(req.params.id);

    if (!upazilla) {
        return next(new ErrorResponse(`Upazilla not found with id of ${req.params.id}`, 404));
    }

    upazilla = await upazilla.update(req.body);

    res.status(200).json({
        success: true,
        data: upazilla
    });
});

// @desc    Delete a upazilla
// @route   DELETE /api/upazillas/:id
// @access  Protected
exports.deleteUpazilla = asyncHandler(async (req, res, next) => {
    const upazilla = await Upazilla.findByPk(req.params.id);

    if (!upazilla) {
        return next(new ErrorResponse(`Upazilla not found with id of ${req.params.id}`, 404));
    }

    // Check for dependent unions
    const dependentUnions = await Union.count({
        where: { upazilla_id: req.params.id }
    });

    if (dependentUnions > 0) {
        return next(new ErrorResponse(`Cannot delete upazilla. It has ${dependentUnions} dependent unions.`, 400));
    }

    await upazilla.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
