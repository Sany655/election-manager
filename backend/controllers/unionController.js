const { Union, Ward, Upazilla } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');

// @desc    Get all unions
// @route   GET /api/unions
// @access  Public/Protected
exports.getUnions = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Union.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']],
        include: [
            {
                model: Upazilla,
                as: 'upazilla',
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

// @desc    Create a union
// @route   POST /api/unions
// @access  Protected
exports.createUnion = asyncHandler(async (req, res, next) => {
    const union = await Union.create(req.body);
    res.status(201).json({
        success: true,
        data: union
    });
});

// @desc    Update a union
// @route   PATCH /api/unions/:id
// @access  Protected
exports.updateUnion = asyncHandler(async (req, res, next) => {
    let union = await Union.findByPk(req.params.id);

    if (!union) {
        return next(new ErrorResponse(`Union not found with id of ${req.params.id}`, 404));
    }

    union = await union.update(req.body);

    res.status(200).json({
        success: true,
        data: union
    });
});

// @desc    Delete a union
// @route   DELETE /api/unions/:id
// @access  Protected
exports.deleteUnion = asyncHandler(async (req, res, next) => {
    const union = await Union.findByPk(req.params.id);

    if (!union) {
        return next(new ErrorResponse(`Union not found with id of ${req.params.id}`, 404));
    }

    // Check for dependent wards
    const dependentWards = await Ward.count({
        where: { union_id: req.params.id }
    });

    if (dependentWards > 0) {
        return next(new ErrorResponse(`Cannot delete union. It has ${dependentWards} dependent wards.`, 400));
    }

    await union.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
