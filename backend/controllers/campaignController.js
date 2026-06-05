const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Campaign, Milestone, EventType } = db;

//@route    POST /api/campaigns
//@desc     Create a new Campaign
//@access   Private
const createCampaign = asyncHandler(async (req, res, next) => {
    const { title, description, startDate, endDate, typeList } = req.body;
    const user_id = req.user.id;

    const campaign = await Campaign.create({
        title,
        description,
        startDate,
        endDate,
        user_id
    });

    if (typeList && Array.isArray(typeList)) {
        for (const item of typeList) {
            if (item.type) {
                // Find or create the EventType by name
                const [eventType, created] = await EventType.findOrCreate({
                    where: { name: item.type },
                    defaults: { name: item.type }
                });

                await Milestone.create({
                    campaign_id: campaign.id,
                    event_type_id: eventType.id,
                    count: item.count || 1,
                    area: item.area
                });
            }
        }
    }

    const fullCampaign = await Campaign.findByPk(campaign.id, {
        include: [
            {
                model: Milestone,
                as: 'milestones',
                include: [
                    {
                        model: EventType,
                        as: 'eventType'
                    }
                ]
            }
        ]
    });

    return res.status(201).json({
        success: true,
        msg: "Campaign created successfully!",
        data: fullCampaign
    });
});

//@route    GET /api/campaigns
//@desc     Get all Campaigns
//@access   Private
const getAllCampaigns = asyncHandler(async (req, res, next) => {
    const campaigns = await Campaign.findAll({
        order: [['startDate', 'ASC']],
        include: [
            {
                model: Milestone,
                as: 'milestones',
                include: [
                    {
                        model: EventType,
                        as: 'eventType'
                    }
                ]
            }
        ]
    });

    res.status(200).json({
        success: true,
        count: campaigns.length,
        data: campaigns,
    });
});

//@route    PATCH /api/campaigns/:id
//@desc     Update a Campaign
//@access   Private
const updateCampaign = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { title, description, startDate, endDate, user_id, typeList } = req.body;

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
        return next(new ErrorResponse('Campaign not found', 404));
    }

    await campaign.update({
        title,
        description,
        startDate,
        endDate,
        user_id
    });

    if (typeList && Array.isArray(typeList)) {
        // Remove existing milestones
        await Milestone.destroy({
            where: { campaign_id: id }
        });

        // Add new milestones
        for (const item of typeList) {
            if (item.type) {
                const [eventType, created] = await EventType.findOrCreate({
                    where: { name: item.type },
                    defaults: { name: item.type }
                });

                await Milestone.create({
                    campaign_id: campaign.id,
                    event_type_id: eventType.id,
                    count: item.count || 1,
                    area: item.area
                });
            }
        }
    }

    const fullCampaign = await Campaign.findByPk(campaign.id, {
        include: [
            {
                model: Milestone,
                as: 'milestones',
                include: [
                    {
                        model: EventType,
                        as: 'eventType'
                    }
                ]
            }
        ]
    });

    return res.status(200).json({
        success: true,
        msg: "Campaign updated successfully!",
        data: fullCampaign
    });
});

//@route    DELETE /api/campaigns/:id
//@desc     Delete a Campaign
//@access   Private
const deleteCampaign = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
        return next(new ErrorResponse('Campaign not found', 404));
    }

    await campaign.destroy();

    return res.status(200).json({
        success: true,
        msg: "Campaign deleted successfully!",
    });
});

module.exports = {
    createCampaign,
    getAllCampaigns,
    updateCampaign,
    deleteCampaign
};
