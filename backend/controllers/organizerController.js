const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorresponse");

const db = require("../models");
const { Organizer, sequelize } = db;   // ✅ sequelize imported here

exports.createOrganizer = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      type,
      contact_person,
      phone,
      email,
      address,
      status,
    } = req.body;

    if (!name) {
      await transaction.rollback();
      return next(new ErrorResponse("Organizer name is required", 400));
    }

    const exists = await Organizer.findOne({
      where: { name },
      transaction,
    });

    if (exists) {
      await transaction.rollback();
      return next(new ErrorResponse("Organizer already exists", 409));
    }

    const organizer = await Organizer.create(
      {
        name,
        type,
        contact_person,
        phone,
        email,
        address,
        status,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      msg: "Organizer created successfully",
      data: organizer,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

exports.updateOrganizer = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  console.log('The request not found');
  
  try {
    const organizer = await Organizer.findByPk(req.params.id, { transaction });

    if (!organizer) {
      await transaction.rollback();
      return next(new ErrorResponse("Organizer not found", 404));
    }

    await organizer.update(req.body, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      msg: "Organizer updated successfully",
      data: organizer,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

exports.deleteOrganizer = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const organizer = await Organizer.findByPk(req.params.id, { transaction });

    if (!organizer) {
      await transaction.rollback();
      return next(new ErrorResponse("Organizer not found", 404));
    }

    await organizer.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      msg: "Organizer deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @route   GET /api/organizers/:id
 * @desc    Get single organizer by ID
 * @access  Protected
 */
exports.getOrganizerById = asyncHandler(async (req, res, next) => {
  const organizer = await Organizer.findByPk(req.params.id);

  if (!organizer) {
    return next(new ErrorResponse("Organizer not found", 404));
  }

  res.status(200).json({
    success: true,
    data: organizer,
  });
});

exports.getOrganizers = asyncHandler(async (req, res) => {
  const organizers = await Organizer.findAll({
    order: [["created_at", "DESC"]],
  });

  res.status(200).json({
    success: true,
    count: organizers.length,
    data: organizers,
  });
});