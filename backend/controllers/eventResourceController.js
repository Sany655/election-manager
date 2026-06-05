const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');
const { EventResource, Resource,sequelize } = require('../models');

/**
 * @route   POST /api/event-resources
 * @desc    Assign resource to an event
 * @access  Admin / Super Admin
 */
const assignResourceToEvent = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { event_id, resource_id, quantity, days } = req.body;

    // Lock resource row (important for future availability logic)
    const resource = await Resource.findByPk(resource_id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!resource || !resource.is_active) {
      throw new ErrorResponse('Resource not found or inactive', 404);
    }

    // Prevent duplicate assignment
    const exists = await EventResource.findOne({
      where: { event_id, resource_id },
      transaction
    });

    if (exists) {
      throw new ErrorResponse('Resource already assigned to this event', 400);
    }

    const rate_per_day = resource.rate_per_day;
    const total_cost = quantity * days * rate_per_day;

    const allocation = await EventResource.create(
      {
        event_id,
        resource_id,
        quantity,
        days,
        rate_per_day,
        total_cost
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      msg: 'Resource assigned to event successfully',
      data: allocation
    });

  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

/**
 * @route   GET /api/event-resources/event/:eventId
 * @desc    Get all resources assigned to an event
 * @access  Public / Optional Auth
 */
const getResourcesByEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const resources = await EventResource.findAll({
    where: { event_id: eventId },
    include: [
      {
        model: Resource,
        as: 'resource',
        attributes: ['id', 'name', 'unit', 'category']
      }
    ]
  });

  return res.status(200).json({
    success: true,
    count: resources.length,
    data: resources
  });
});

/**
 * @route   PATCH /api/event-resources/:id
 * @desc    Update assigned resource (quantity/days)
 * @access  Admin / Super Admin
 */
const updateEventResource = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const allocation = await EventResource.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!allocation) {
      throw new ErrorResponse('Event resource not found', 404);
    }

    const { quantity, days } = req.body;

    const updatedData = {};

    const finalQuantity = quantity ?? allocation.quantity;
    const finalDays = days ?? allocation.days;

    updatedData.quantity = finalQuantity;
    updatedData.days = finalDays;
    updatedData.total_cost =
      finalQuantity * finalDays * allocation.rate_per_day;

    await allocation.update(updatedData, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      msg: 'Event resource updated successfully',
      data: allocation
    });

  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

/**
 * @route   DELETE /api/event-resources/:id
 * @desc    Remove resource from event
 * @access  Admin / Super Admin
 */
const deleteEventResource = asyncHandler(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const allocation = await EventResource.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!allocation) {
      throw new ErrorResponse('Event resource not found', 404);
    }

    await allocation.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      msg: 'Resource removed from event successfully'
    });

  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

module.exports = {
  assignResourceToEvent,
  getResourcesByEvent,
  updateEventResource,
  deleteEventResource
};