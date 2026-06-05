const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorresponse');
const { EventResource } = require('../models');

/**
 * @route   GET /api/event-grand-total/:eventId
 * @desc    Get grand total cost for an event
 * @access  Public / Optional Auth
 */
const getEventGrandTotal = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  if (!eventId) {
    return next(new ErrorResponse('Event ID is required', 400));
  }

  // -------------------------
  // RESOURCE COST
  // -------------------------
  const resourceRows = await EventResource.findAll({
    where: { event_id: eventId },
    attributes: ['total_cost']
  });

  const resourceTotal = resourceRows.reduce(
    (sum, row) => sum + Number(row.total_cost),
    0
  );

  // -------------------------
  // FUTURE EXTENSIONS
  // -------------------------
  const venueTotal = 0;   // later: VenueBooking table
  const staffTotal = 0;   // later: EventStaff table
  const cateringTotal = 0; // later

  const grandTotal =
    resourceTotal + venueTotal + staffTotal + cateringTotal;

  return res.status(200).json({
    success: true,
    event_id: Number(eventId),
    totals: {
      resources: resourceTotal,
      venue: venueTotal,
      staff: staffTotal,
      catering: cateringTotal,
      grand_total: grandTotal
    }
  });
});

module.exports = {
  getEventGrandTotal
};