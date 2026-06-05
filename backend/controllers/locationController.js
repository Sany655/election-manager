const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Location, Team } = db;


//@route    /api/locations
//@desc     POST: create a new location
//@access   protected by admin
const createLocation = asyncHandler(async (req, res, next) => {
    const { location_name, company_id, team_id } = req.body;


    const isExist = await Location.findOne({ where: { location_name } })
    if (isExist) {
        return next(new ErrorResponse('Location Already Exist', 400));
    }
    const location = new Location({
        location_name,
        company_id: company_id || 1,
        team_id,
    });
    const newlocation = await location.save();

    const selectedData = {
        location_id: newlocation.id,
        location_name: newlocation.location_name,
        company_id: newlocation.company_id,
        team_id: newlocation.team_id
    }

    return res.status(200).json({
        success: true,
        msg: "Location created successfully!",
        data: selectedData
    });
})


//@route    /api/locations?team_id
//@desc     GET:fetch all locations
//@access   public(optional protection given)
const getLocations = asyncHandler(async (req, res, next) => {
    const { team_id } = req.query;

    const whereClause = {};
    if (team_id) {
        whereClause.team_id = team_id;
    }

    const { count, rows } = await Location.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'location_name', 'address', 'company_id', 'team_id'],
        order: [['createdAt', 'DESC']],
        include: {
            model: Team,
            as: 'team',
            attributes: ['id', 'name']
        },
        // limit: req.query.limit ? parseInt(req.query.limit) : 10,
        // offset: req.query.page ? (parseInt(req.query.page) - 1) * (req.query.limit ? parseInt(req.query.limit) : 10) : 0
    });

    return res.status(200).json({
        success: true,
        msg: "Location fetched successfully!",
        count: count,
        data: rows
    });
})


//@route    /api/locations/:id
//@desc     PATCH: update a location
//@access   protected by admin
const editLocation = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { location_name, location_address, company_id, team_id } = req.body;
    const location = await Location.findByPk(id);

    if (!location) {
        return next(new ErrorResponse('No Location Found to Update!', 404));
    }

    const updatedlocation = {};
    let isChanged = false;

    if (location_name?.trim() && location.location_name !== location_name) {
        updatedlocation.location_name = location_name.trim();
        isChanged = true;
    }
    if (location_address?.trim() && location.address !== location_address) {
        updatedlocation.address = location_address.trim();
        isChanged = true;
    }
    if (company_id && location.company_id !== company_id) {
        updatedlocation.company_id = company_id;
        isChanged = true;
    }
    if (team_id && location.team_id !== team_id) {
        updatedlocation.team_id = team_id;
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            msg: "Nothing Updated!",
            data: {
                id: location.id,
                location_name: location.location_name,
                location_address: location.address,
                company_id: location.company_id,
                team_id: location.team_id,
            }
        });
    }

    await location.update(updatedlocation);

    return res.status(200).json({
        success: true,
        msg: "Location updated successfully!",
        data: {
            id: location.id,
            location_name: location.location_name,
            location_address: location.address,
            company_id: location.company_id,
            team_id: location.team_id,
        }
    });
})


//@route    /api/location/:id/delete
//@desc     DELETE: delete a location Permanently
//@access   protected by admin
const deleteLocationPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const location = await Location.findByPk(id);

    if (!location) {
        return next(new ErrorResponse('No Location Found to Delete!', 404));
    }

    await location.destroy();

    return res.status(200).json({
        success: true,
        msg: `${location.location_name} deleted successfully!`,
    });
})


module.exports = {
    createLocation,
    editLocation,
    getLocations,
    deleteLocationPermanently
}