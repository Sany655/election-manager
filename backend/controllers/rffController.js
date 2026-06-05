const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { RffPoint, Territory } = db;


//@route    /api/rff-points
//@desc     POST: create a new rff_point
//@access   protected by admin
const createRffPoint = asyncHandler(async (req, res, next) => {
    let { rff_point_name, sap_code, territory_id, company_id } = req.body;

    // Trim input
    rff_point_name = rff_point_name?.trim();
    sap_code = sap_code?.trim();

    if (!rff_point_name) {
        return next(new ErrorResponse('Rff Point Name is required', 400));
    }
    if (!sap_code) {
        return next(new ErrorResponse('Sap Code is required', 400));
    }

    const isExist = await RffPoint.findOne({ where: { name: rff_point_name } });
    if (isExist) {
        return next(new ErrorResponse('Rff Point already exists', 400));
    }

    const rff = await RffPoint.create({
        name: rff_point_name,
        rff_sub_code: sap_code,
        territory_id,
        company_id: company_id || 1,
    });

    const selectedData = {
        rff_id: rff.id,
        rff_point_name: rff.name,
        sap_code: rff.rff_sub_code,
        territory: rff.territory_id,
    };

    return res.status(200).json({
        success: true,
        msg: "Rff Point created successfully!",
        data: selectedData,
    });
});



//@route    /api/rff_points?territory_id=1&company_id=1
//@desc     GET: Fetch all rff_points
//@access   Public (optional protection given)

const getRffPoints = asyncHandler(async (req, res, next) => {
    const { territory_id, company_id, page = 1, limit = 10, location_id } = req.query;

    const whereClause = {};
    if (territory_id) whereClause.territory_id = territory_id;
    if (company_id) whereClause.company_id = company_id;

    const { count, rows } = await RffPoint.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'name', 'rff_sub_code','territory_id','createdAt','start_date','isActive'],
        include: [
            {
                model: Territory,
                as: 'territory',
                attributes: ['id', 'name']
            }
        ],
        order: [['createdAt', 'DESC']],
        // limit: parseInt(limit),
        // offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return res.status(200).json({
        success: true,
        message: "Rff points fetched successfully!",
        total: count,
        page: parseInt(page),
        perPage: parseInt(limit),
        data: rows,
    });
});



//@route    PATCH /api/rff-points/:id
//@desc     Update a RffPoint
//@access   Protected by admin

const editRffPoint = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { rff_point_name, sap_code, territory_id, company_id, start_date, isActive } = req.body;

    const rff_point = await RffPoint.findByPk(id);

    if (!rff_point) {
        return next(new ErrorResponse('No Rff Point found to update!', 404));
    }

    const updatedFields = {};
    let isChanged = false;

    if (rff_point_name?.trim() && rff_point.name !== rff_point_name.trim()) {
        updatedFields.name = rff_point_name.trim();
        isChanged = true;
    }

    if (sap_code && rff_point.rff_sub_code !== sap_code) {
        updatedFields.rff_sub_code = sap_code;
        isChanged = true;
    }

    if (start_date?.trim() && start_date.start_date !== start_date.trim()) {
        updatedFields.start_date = start_date.trim();
        isChanged = true;
    }

    if (territory_id && rff_point.territory_id !== parseInt(territory_id)) {
        updatedFields.territory_id = parseInt(territory_id);
        isChanged = true;
    }

    // You mentioned company_id but it's not being used — add if necessary
    if (company_id && rff_point.company_id !== parseInt(company_id)) {
        updatedFields.company_id = parseInt(company_id);
        isChanged = true;
    }

    if (isActive !== undefined && rff_point.isActive !== isActive) {
        updatedFields.isActive = isActive;
        isChanged = true;
    }


    if (!isChanged) {
        return res.status(200).json({
            success: true,
            message: "Nothing updated!",
            data: {
                id: rff_point.id,
                territory_id: rff_point.territory_id,
                rff_point_name: rff_point.name,
                sap_code: rff_point.rff_sub_code,
                company_id: rff_point.company_id,
                start_date: rff_point.start_date,
                isActive: rff_point.isActive,
            }
        });
    }

    await rff_point.update(updatedFields);

    return res.status(200).json({
        success: true,
        message: "Rff Point updated successfully!",
        data: {
            id: rff_point.id,
            rff_point_name: rff_point.name,
            sap_code: rff_point.rff_sub_code,
            territory_id: rff_point.territory_id,
            company_id: rff_point.company_id,
            start_date: rff_point.start_date,
            isActive: rff_point.isActive,
        }
    });
});




//@route    /api/rff-points/:id/delete
//@desc     DELETE: delete a RffPoint Permanently
//@access   protected by admin
const deleteRffPointPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const rff_point = await RffPoint.findByPk(id);

    if (!rff_point) {
        return next(new ErrorResponse('No Rff point Found to Delete!', 404));
    }

    await rff_point.destroy();

    return res.status(200).json({
        success: true,
        msg: `${rff_point.name} deleted successfully!`,
    });
})


module.exports = {
    createRffPoint,
    getRffPoints,
    editRffPoint,
    deleteRffPointPermanently
}