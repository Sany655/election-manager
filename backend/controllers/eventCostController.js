const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorresponse");

const db = require("../models");
const { Event, Resource, EventResource, sequelize } = db;

/**
 * @route   POST /api/events/:eventId/resources
 * @desc    Allocate resource to event (add cost)
 * @access  Admin
 */
exports.addEventResource = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { eventId } = req.params;
    const { resource_id, quantity, days } = req.body;

    if (!eventId || !resource_id || !quantity || !days) {
      await transaction.rollback();
      return next(new ErrorResponse("Missing required fields", 400));
    }

    const event = await Event.findByPk(eventId, { transaction });
    if (!event) {
      await transaction.rollback();
      return next(new ErrorResponse("Event not found", 404));
    }

    const resource = await Resource.findByPk(resource_id, { transaction });
    if (!resource) {
      await transaction.rollback();
      return next(new ErrorResponse("Resource not found", 404));
    }

    const ratePerDay = resource.rate_per_day;
    const totalCost = Number(ratePerDay) * quantity * days;

    const allocation = await EventResource.create(
      {
        event_id: eventId,
        resource_id,
        quantity,
        days,
        rate_per_day: ratePerDay,
        total_cost: totalCost,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      msg: "Resource allocated to event successfully",
      data: allocation,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @route   PATCH /api/events/:eventId/resources/:id
 * @desc    Update event resource allocation
 * @access  Admin
 */
exports.updateEventResource = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { eventId, id } = req.params;
    const { quantity, days } = req.body;

    const allocation = await EventResource.findOne({
      where: { id, event_id: eventId },
      transaction,
    });

    if (!allocation) {
      await transaction.rollback();
      return next(new ErrorResponse("Resource allocation not found", 404));
    }

    const totalCost =
      allocation.rate_per_day * (quantity ?? allocation.quantity) * (days ?? allocation.days);

    await allocation.update(
      {
        quantity: quantity ?? allocation.quantity,
        days: days ?? allocation.days,
        total_cost: totalCost,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      msg: "Event resource updated successfully",
      data: allocation,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @route   DELETE /api/events/:eventId/resources/:id
 * @desc    Remove resource from event
 * @access  Admin
 */
exports.deleteEventResource = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { eventId, id } = req.params;

    const allocation = await EventResource.findOne({
      where: { id, event_id: eventId },
      transaction,
    });

    if (!allocation) {
      await transaction.rollback();
      return next(new ErrorResponse("Resource allocation not found", 404));
    }

    await allocation.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      success: true,
      msg: "Resource removed from event",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @route   GET /api/events/:eventId/resources
 * @desc    Get all resources allocated to an event
 * @access  Protected
 */
exports.getEventResources = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const allocations = await EventResource.findAll({
    where: { event_id: eventId },
    include: [
      {
        model: Resource,
        as: "resource",
        attributes: ["id", "name", "unit", "rate_per_day"],
      },
    ],
    order: [["created_at", "ASC"]],
  });

  res.status(200).json({
    success: true,
    count: allocations.length,
    data: allocations,
  });
});

/**
 * @route   GET /api/events/:eventId/cost-summary
 * @desc    Get event cost summary
 * @access  Protected
 */
exports.getEventCostSummary = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findByPk(eventId);
  if (!event) {
    return next(new ErrorResponse("Event not found", 404));
  }

  const allocations = await EventResource.findAll({
    where: { event_id: eventId },
    include: [
      {
        model: Resource,
        as: "resource",
        attributes: ["id", "name", "unit"],
      },
    ],
  });

  let totalQuantity = 0;
  let totalDays = 0;
  let totalCost = 0;

  const breakdown = allocations.map((a) => {
    totalQuantity += a.quantity;
    totalDays += a.days;
    totalCost += Number(a.total_cost);

    return {
      resource_id: a.resource_id,
      resource_name: a.resource?.name,
      unit: a.resource?.unit,
      quantity: a.quantity,
      days: a.days,
      rate_per_day: a.rate_per_day,
      total_cost: a.total_cost,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      event_id: eventId,
      total_resources: allocations.length,
      total_quantity: totalQuantity,
      total_days: totalDays,
      total_cost: Number(totalCost.toFixed(2)),
      breakdown,
    },
  });
});