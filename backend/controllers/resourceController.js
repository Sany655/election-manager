const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');
const { Resource } = require('../models');
const logAudit = require('../utils/auditLogger');
const db = require("../models");

const { sequelize } = db;

/**
 * @route   POST /api/resources
 * @desc    Create new resource
 * @access  Admin / Super Admin
 */
const createResource = asyncHandler(async (req, res, next) => {
  const {
    name,
    category,
    unit,
    rate_per_day,
    description,
    is_active
  } = req.body;

  if (!name || !rate_per_day) {
    return next(new ErrorResponse('Resource name and rate_per_day are required', 400));
  }

  const resource = await Resource.create({
    name: name.trim(),
    category: category || null,
    unit: unit || 'piece',
    rate_per_day,
    description: description || null,
    is_active: is_active !== undefined ? is_active : true
  });

  return res.status(201).json({
    success: true,
    msg: 'Resource created successfully',
    data: resource
  });
});


/**
 * @route   GET /api/resources
 * @desc    Get all resources
 * @access  Public
 */
const getResources = asyncHandler(async (req, res, next) => {
  const resources = await Resource.findAll({
    order: [['created_at', 'DESC']]
  });

  return res.status(200).json({
    success: true,
    count: resources.length,
    data: resources
  });
});


/**
 * @route   GET /api/resources/:id
 * @desc    Get resource by ID
 * @access  Public
 */
const getResourceById = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findByPk(req.params.id);

  if (!resource) {
    return next(new ErrorResponse('Resource not found', 404));
  }

  return res.status(200).json({
    success: true,
    data: resource
  });
});


/**
 * @route   PATCH /api/resources/:id
 * @desc    Update resource
 * @access  Admin / Super Admin
 */
const updateResource = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const resource = await Resource.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!resource) {
      throw new ErrorResponse('Resource not found', 404);
    }

    const oldValue = resource.toJSON();

    await resource.update(req.body, { transaction });

    await logAudit({
      entity_type: 'resource',
      entity_id: resource.id,
      action: 'UPDATE',
      old_value: oldValue,
      new_value: resource.toJSON(),
      changed_by: req.user?.id,
      transaction
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      msg: 'Resource updated successfully',
      data: resource
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});


/**
 * @route   DELETE /api/resources/:id
 * @desc    Soft delete resource (disable)
 * @access  Admin / Super Admin
 */
const deleteResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findByPk(req.params.id);

  if (!resource) {
    return next(new ErrorResponse('Resource not found', 404));
  }

  // Soft delete (recommended)
  await resource.update({ is_active: false });

  return res.status(200).json({
    success: true,
    msg: 'Resource disabled successfully'
  });
});

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource
};