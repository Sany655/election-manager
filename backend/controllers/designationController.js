const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Designation, User } = db;
const { Op } = require('sequelize');


//@route    /api/designations
//@desc     POST: create a new designation
//@access   protected by admin
const createDesignation = asyncHandler(async (req, res, next) => {
  const { designation_name, designation_description } = req.body;

  const isExist = await Designation.findOne({ where: { name: designation_name } })
  if (isExist) {
    return next(new ErrorResponse('Designation Already Exist', 400));
  }
  const designation = new Designation({
    name: designation_name,
    description: designation_description,

  });
  const newDesignation = await designation.save();

  const selectedData = {
    designation_id: newDesignation.id,
    designation_name: newDesignation.name,
    designation_description: newDesignation.description,
  }

  return res.status(200).json({
    success: true,
    msg: "Designation created successfully!",
    data: selectedData
  });
})


//@route    /api/designations
//@desc     GET:fetch all designations
//@access   public(optional protection given)
const getDesignations = asyncHandler(async (req, res, next) => {
  const { count, rows } = await Designation.findAndCountAll({
    attributes: ['id', 'name', 'description'],
    order: [['createdAt', 'DESC']],
    // limit: req.query.limit ? parseInt(req.query.limit) : 10,
    // offset: req.query.page ? (parseInt(req.query.page) - 1) * (req.query.limit ? parseInt(req.query.limit) : 10) : 0
  });

  // if (!rows || rows.length === 0) {
  //     return next(new ErrorResponse('No designation Found!', 404));
  // }

  return res.status(200).json({
    success: true,
    msg: "Designations fetched successfully!",
    count: count,
    data: rows
  });
})


//@route    /api/designations/:id
//@desc     PATCH: update a designation
//@access   protected by admin
const editDesignation = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { designation_name, designation_description } = req.body;
  const designation = await Designation.findByPk(id);

  if (!designation) {
    return next(new ErrorResponse('No designation Found to Update!', 404));
  }

  const updatedDesignation = {};
  let isChanged = false;

  if (designation_name?.trim() && designation.name !== designation_name) {
    updatedDesignation.name = designation_name.trim();
    isChanged = true;
  }
  if (designation_description?.trim() && designation.description !== designation_description) {
    updatedDesignation.description = designation_description.trim();
    isChanged = true;
  }

  if (!isChanged) {
    return res.status(200).json({
      success: true,
      msg: "Nothing Updated!",
      data: {
        id: designation.id,
        designation_name: designation.name,
        designation_description: designation.description,
      }
    });
  }

  await designation.update(updatedDesignation);

  return res.status(200).json({
    success: true,
    msg: "Designation updated successfully!",
    data: {
      id: designation.id,
      designation_name: designation.name,
      designation_description: designation.description,
    }
  });
})


//@route    /api/designations/:id/delete
//@desc     DELETE: delete a designation Permanently
//@access   protected by admin
const deleteDesignationPermanently = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const designation = await Designation.findByPk(id);

  if (!designation) {
    return next(new ErrorResponse('No designation Found to Delete!', 404));
  }

  // Check if any users are assigned this designation
  const userCount = await User.count({ where: { designation_id: id } });
  if (userCount > 0) {
    return next(new ErrorResponse('Cannot delete designation as it is assigned to users.', 400));
  }

  await designation.destroy();

  return res.status(200).json({
    success: true,
    msg: `${designation.name} deleted successfully!`,
  });
})


//@route    POST /api/designations/assign
//@desc     Assign designations to users 
//@access   Protected (Admin)
const assignDesignationBulk = asyncHandler(async (req, res, next) => {
  const { designation_id, user_ids } = req.body;

  if (!designation_id) {
    return next(new ErrorResponse('No designation provided for assignment', 400));
  }

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return next(new ErrorResponse('Must provide user_ids', 400));
  }

  // Filter only users who need updating
  const usersToUpdate = await User.findAll({
    where: {
      id: { [Op.in]: user_ids },
      [Op.or]: [
        { designation_id: null },
        { designation_id: { [Op.ne]: designation_id } },
      ],
    },
    attributes: ['id']
  });

  if (usersToUpdate.length === 0) {
    return res.status(200).json({
      success: false,
      msg: 'All selected users already have this designation.',
      updatedCount: 0
    });
  }

  const updateIds = usersToUpdate.map(user => user.id);

  const [updatedCount] = await User.update(
    { designation_id },
    {
      where: {
        id: { [Op.in]: updateIds }
      }
    }
  );

  res.status(200).json({
    success: true,
    msg: `${updatedCount} users updated with new designation.`,
    updatedCount,
  });
});



module.exports = {
  createDesignation,
  getDesignations,
  editDesignation,
  deleteDesignationPermanently,
  assignDesignationBulk
}