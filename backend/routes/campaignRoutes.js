const express = require('express');
const router = express.Router();
const {
    createCampaign,
    getAllCampaigns,
    updateCampaign,
    deleteCampaign
} = require('../controllers/campaignController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { createCampaignValidationRules, updateCampaignValidationRules } = require('../dtos/campaignDto');

router.use(protect);

router.route('/')
    .post(createCampaignValidationRules(), validator, createCampaign) // TODO: Add specific permission
    .get(checkPermission(['view-campaign-overview']), getAllCampaigns);

router.route('/:id')
    .patch(updateCampaignValidationRules(), validator, updateCampaign) // TODO: Add specific permission
    .delete(deleteCampaign); // TODO: Add specific permission

module.exports = router;
