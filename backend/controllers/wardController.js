const { Ward, Union } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');

// @desc    Get all wards
// @route   GET /api/wards
// @access  Public/Protected
exports.getWards = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Ward.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']],
        include: [
            {
                model: Union,
                as: 'union',
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

// @desc    Create a ward
// @route   POST /api/wards
// @access  Protected
exports.createWard = asyncHandler(async (req, res, next) => {
    const ward = await Ward.create(req.body);
    res.status(201).json({
        success: true,
        data: ward
    });
});

// @desc    Update a ward
// @route   PATCH /api/wards/:id
// @access  Protected
exports.updateWard = asyncHandler(async (req, res, next) => {
    let ward = await Ward.findByPk(req.params.id);

    if (!ward) {
        return next(new ErrorResponse(`Ward not found with id of ${req.params.id}`, 404));
    }

    ward = await ward.update(req.body);

    res.status(200).json({
        success: true,
        data: ward
    });
});

// @desc    Delete a ward
// @route   DELETE /api/wards/:id
// @access  Protected
exports.deleteWard = asyncHandler(async (req, res, next) => {
    const ward = await Ward.findByPk(req.params.id);

    if (!ward) {
        return next(new ErrorResponse(`Ward not found with id of ${req.params.id}`, 404));
    }

    await ward.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
