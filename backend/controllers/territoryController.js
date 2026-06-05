const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Territory, Area } = db;


//@route    /api/territories
//@desc     POST: create a new territotry
//@access   protected by admin
const createTerritory = asyncHandler(async (req, res, next) => {
    let { territory_name, territotry_description,location_id, area_id, company_id } = req.body;

    // Trim input
    territory_name = territory_name?.trim();
    territotry_description = territotry_description?.trim();

    if (!territory_name) {
        return next(new ErrorResponse('Territotry name is required', 400));
    }

    const isExist = await Territory.findOne({ where: { name: territory_name } });
    if (isExist) {
        return next(new ErrorResponse('Territotry already exists', 400));
    }

    const territotry = await Territory.create({
        name: territory_name,
        description: territotry_description || null,
        area_id,
        company_id: company_id || 1,
        location_id, //optional
    });

    const selectedData = {
        territotry_id: territotry.id,
        territory_name: territotry.name,
        territotry_description: territotry.description,
        area_id: territotry.area_id,
    };

    return res.status(200).json({
        success: true,
        msg: "Territory created successfully!",
        data: selectedData,
    });
});



//@route    /api/territories?area_id=1&company_id=1&location_id
//@desc     GET: Fetch all territotrys
//@access   Public (optional protection given)

const getTerritotries = asyncHandler(async (req, res, next) => {
    const { area_id, company_id, page = 1, limit = 10, location_id } = req.query;

    const whereClause = {};
    if (area_id) whereClause.area_id = area_id;
    if (company_id) whereClause.company_id = company_id;
    if (location_id) whereClause.location_id = location_id;

    const { count, rows } = await Territory.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'name','area_id'],
        include:{
            model:Area,
            as:'area',
            attributes:['id','area_name']
        },
        order: [['createdAt', 'DESC']],
        // limit: parseInt(limit),
        // offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return res.status(200).json({
        success: true,
        message: "Territories fetched successfully!",
        total: count,
        page: parseInt(page),
        perPage: parseInt(limit),
        data: rows,
    });
});



//@route    PATCH /api/territories/:id
//@desc     Update a territory
//@access   Protected by admin

const editTerritory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { territory_name, territotry_description, area_id, company_id, location_id } = req.body;

    const territory = await Territory.findByPk(id);

    if (!territory) {
        return next(new ErrorResponse('No Territory found to update!', 404));
    }

    const updatedFields = {};
    let isChanged = false;

    if (territory_name?.trim() && territory.name !== territory_name.trim()) {
        updatedFields.name = territory_name.trim();
        isChanged = true;
    }

    if (territotry_description?.trim() && territory.description !== territotry_description.trim()) {
        updatedFields.description = territotry_description.trim();
        isChanged = true;
    }
    if (area_id && territory.area_id !== area_id) {
        updatedFields.area_id = area_id;
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            message: "Nothing updated!",
            data: {
                id: territory.id,
                area_id: territory.area_id,
                territory_name: territory.name,
                territotry_description: territory.description,
            }
        });
    }

    await territory.update(updatedFields);

    return res.status(200).json({
        success: true,
        message: "Territory updated successfully!",
        data: {
            id: territory.id,
            territory_name: territory.name,
            territotry_description: territory.description,
        }
    });
});



//@route    /api/territories/:id/delete
//@desc     DELETE: delete a Territory Permanently
//@access   protected by admin
const deleteTerritoryPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const territotry = await Territory.findByPk(id);

    if (!territotry) {
        return next(new ErrorResponse('No territotry Found to Delete!', 404));
    }

    await territotry.destroy();

    return res.status(200).json({
        success: true,
        msg: `${territotry.name} deleted successfully!`,
    });
})


module.exports = {
    createTerritory,
    getTerritotries,
    editTerritory,
    deleteTerritoryPermanently
}