const express = require("express");
const router = express.Router();

const {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
  deleteOrganizer,
} = require("../controllers/organizerController");

const { protect, checkPermission } = require("../middleware/authMiddleware");
const validator = require("../middleware/validator");

const {
  createOrganizerValidationRules,
  updateOrganizerValidationRules,
  deleteOrganizerValidationRules,
} = require("../dtos/organizerDto");

/**
 * @route   /api/organizers
 */

// CREATE organizer (Admin only)
router.post(
  "/",
  protect,
  checkPermission(['add-organizers']),
  createOrganizerValidationRules(),
  validator,
  createOrganizer
);

// GET all organizers (used for dropdowns)
router.get(
  "/",
  protect, // use optionalAuth if needed
  checkPermission(['view-organizers']),
  getOrganizers
);

// GET organizer by ID
router.get(
  "/:id",
  protect,
  checkPermission(['view-organizers']),
  getOrganizerById
);

// UPDATE organizer (Admin only)
router.patch(
  "/:id",
  protect,
  checkPermission(['edit-organizers']),
  updateOrganizerValidationRules(),
  validator,
  updateOrganizer
);

// DELETE organizer (Admin only)
router.delete(
  "/:id",
  protect,
  checkPermission(['delete-organizers']),
  deleteOrganizerValidationRules(),
  validator,
  deleteOrganizer
);

module.exports = router;