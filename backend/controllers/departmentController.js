const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Department } = db;


//@route    /api/departments
//@desc     POST: create a new department
//@access   protected by admin
const createDepartment = asyncHandler(async (req, res, next) => {
    const { department_name, department_description } = req.body;

    const isExist = await Department.findOne({ where: { name: department_name } })
    if (isExist) {
        return next(new ErrorResponse('Department Already Exist', 400));
    }
    const department = new department({
        name: department_name,
        description: department_description,

    });
    const newDepartment = await department.save();

    const selectedData = {
        department_id: newDepartment.id,
        department_name: newDepartment.name,
        department_description: newDepartment.description,
    }

    return res.status(200).json({
        success: true,
        msg: "Department created successfully!",
        data: selectedData
    });
})


//@route    /api/departments
//@desc     GET:fetch all departments
//@access   public(optional protection given)
const getDepartments = asyncHandler(async (req, res, next) => {
    const { count, rows } = await Department.findAndCountAll({
        attributes: ['id', 'name', 'description'],
        order: [['createdAt', 'DESC']],
        // limit: req.query.limit ? parseInt(req.query.limit) : 10,
        // offset: req.query.page ? (parseInt(req.query.page) - 1) * (req.query.limit ? parseInt(req.query.limit) : 10) : 0
    });

    if (!rows || rows.length === 0) {
        return next(new ErrorResponse('No department Found!', 404));
    }

    return res.status(200).json({
        success: true,
        msg: "Departments fetched successfully!",
        count: count,
        data: rows
    });
})


//@route    /api/departments/:id
//@desc     PATCH: update a department
//@access   protected by admin
const editDepartment = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { department_name, department_description } = req.body;
    const department = await Department.findByPk(id);

    if (!department) {
        return next(new ErrorResponse('No department Found to Update!', 404));
    }

    const updateddepartment = {};
    let isChanged = false;

    if (department_name?.trim() && department.name !== department_name) {
        updateddepartment.name = department_name.trim();
        isChanged = true;
    }
    if (department_description?.trim() && department.description !== department_description) {
        updateddepartment.description = department_description.trim();
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            msg: "Nothing Updated!",
            data: {
                id: department.id,
                department_name: department.name,
                department_description: department.description,
            }
        });
    }

    await department.update(updateddepartment);

    return res.status(200).json({
        success: true,
        msg: "Department updated successfully!",
        data: {
            id: department.id,
            department_name: department.name,
            department_description: department.description,
        }
    });
})


//@route    /api/department/:id/delete
//@desc     DELETE: delete a department Permanently
//@access   protected by admin
const deleteDepartmentPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const department = await Department.findByPk(id);

    if (!department) {
        return next(new ErrorResponse('No department Found to Delete!', 404));
    }

    await department.destroy();

    return res.status(200).json({
        success: true,
        msg: `${department.name} deleted successfully!`,
    });
})


module.exports = {
    createDepartment,
    getDepartments,
    editDepartment,
    deleteDepartmentPermanently
}