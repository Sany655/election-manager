const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const { CampaignType } = db;

//@route    GET /api/campaign-types
//@desc     Get all Campaign Types
//@access   Private
const getAllCampaignTypes = asyncHandler(async (req, res, next) => {
    const types = await CampaignType.findAll({
        order: [['name', 'ASC']]
    });

    res.status(200).json({
        success: true,
        count: types.length,
        data: types,
    });
});

//@route    POST /api/campaign-types
//@desc     Create a new Campaign Type
//@access   Private
const createCampaignType = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    const type = await CampaignType.create({
        name
    });

    return res.status(201).json({
        success: true,
        msg: "Campaign Type created successfully!",
        data: type
    });
});

module.exports = {
    getAllCampaignTypes,
    createCampaignType
};
