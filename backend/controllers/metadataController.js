const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorresponse");
const db = require('../models/index');
const { AppMetadata } = db;


//@route    /api/app/metadata?company_id
//@desc     GET:fetch metdata
//@access   public(optional protection given)
const getAppMetadata = asyncHandler(async (req, res, next) => {
    const { company_id } = req.query;
    const whereClause = {};
    if (company_id) {
        whereClause.company_id = company_id;
    }

    const meta = await AppMetadata.findAll({
        where: whereClause,
        attributes: ['id', 'version', 'company_id'],
    });

    return res.status(200).json({
        success: true,
        msg: "Metadata fetched successfully!",
        data: meta
    });
})




module.exports = {
    getAppMetadata,
}