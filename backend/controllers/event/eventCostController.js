const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');
const { EventResource, Resource } = require('../models');

/**
 * @route   GET /api/event-cost/:eventId
 * @desc    Get total resource cost summary for an event
 * @access  Public / Optional Auth
 */
const getEventCostSummary = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  if (!eventId) {
    return next(new ErrorResponse('Event ID is required', 400));
  }

  const allocations = await EventResource.findAll({
    where: { event_id: eventId },
    include: [
      {
        model: Resource,
        as: 'resource',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!allocations.length) {
    return res.status(200).json({
      success: true,
      event_id: eventId,
      summary: {
        total_resources: 0,
        total_cost: 0
      },
      breakdown: []
    });
  }

  let totalCost = 0;

  const breakdown = allocations.map(item => {
    totalCost += Number(item.total_cost);

    return {
      resource_id: item.resource_id,
      resource_name: item.resource?.name,
      quantity: item.quantity,
      days: item.days,
      rate_per_day: Number(item.rate_per_day),
      total_cost: Number(item.total_cost)
    };
  });

  return res.status(200).json({
    success: true,
    event_id: Number(eventId),
    summary: {
      total_resources: allocations.length,
      total_cost: totalCost
    },
    breakdown
  });
});

module.exports = {
  getEventCostSummary
};