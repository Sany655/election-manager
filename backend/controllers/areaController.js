const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Area, Location } = db;


//@route    /api/areas
//@desc     POST: create a new area
//@access   protected by admin
const createArea = asyncHandler(async (req, res, next) => {
    const { area_name, area_address, company_id, location_id } = req.body;

    const isExist = await Area.findOne({ where: { area_name } })
    if (isExist) {
        return next(new ErrorResponse('Area Already Exist', 400));
    }
    const area = new Area({
        area_name,
        address: area_address,
        company_id, 
        location_id
    });
    const newarea = await area.save();

    const selectedData = {
        area_id: newarea.id,
        area_name: newarea.area_name,
        area_address: newarea.address,
        company_id:newarea.company_id
    }

    return res.status(200).json({
        success: true,
        msg: "Area created successfully!",
        data: selectedData
    });
})


//@route    /api/areas?location_id
//@desc     GET:fetch all areas
//@access   public(optional protection given)
const getAreas = asyncHandler(async (req, res, next) => {
  const { location_id } = req.query;

  const whereClause = {};
  if (location_id) {
    whereClause.location_id = location_id;
  }

  const areas = await Area.findAll({ 
    where: whereClause ,
    include:[
        {
            model:Location,
            as:'location',
            attributes:['id','location_name']
        }
    ]
});

  res.status(200).json({
    success: true,
    message: 'Areas fetched successfully!',
    count: areas.length,
    data: areas,
  });
});




//@route    /api/areas/:id
//@desc     PATCH: update a area
//@access   protected by admin
const editArea = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { area_name, company_id, location_id } = req.body;
    const area = await Area.findByPk(id);

    if (!area) {
        return next(new ErrorResponse('No Area Found to Update!', 404));
    }

    const updatedarea = {};
    let isChanged = false;

    if (area_name?.trim() && area.area_name !== area_name) {
        updatedarea.area_name = area_name.trim();
        isChanged = true;
    }

    if (location_id && area.location_id !== location_id) {
        updatedarea.location_id = location_id;
        isChanged = true;
    }
    if (company_id && area.company_id !== company_id) {
        updatedarea.company_id = company_id;
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            msg: "Nothing Updated!",
            data: {
                id: area.id,
                area_name: area.area_name,
                location_id: area.location_id,
                company_id: area.company_id,
            }
        });
    }

    await area.update(updatedarea);

    return res.status(200).json({
        success: true,
        msg: "area updated successfully!",
        data: {
            id: area.id,
            area_name: area.area_name,
            area_address: area.address,
            company_id: area.company_id,
        }
    });
})


//@route    /api/area/:id/delete
//@desc     DELETE: delete a area Permanently
//@access   protected by admin
const deleteAreaPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const area = await Area.findByPk(id);

    if (!area) {
        return next(new ErrorResponse('No area Found to Delete!', 404));
    }

    await area.destroy();

    return res.status(200).json({
        success: true,
        msg: `${area.area_name} deleted successfully!`,
    });
})


module.exports = {
   createArea,
   editArea,
   getAreas,
   deleteAreaPermanently
}