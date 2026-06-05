const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const slugify = require('slugify');
const ErrorResponse = require("../utils/errorresponse");
const { Company } = db;


//@route    /api/companies
//@desc     POST: create a new company
//@access   protected by admin
const createCompany = asyncHandler(async (req, res, next) => {
    const { company_name, company_address } = req.body;

    const isExist = await Company.findOne({ where: { company_name } })
    if (isExist) {
        return next(new ErrorResponse('Company Already Exist', 400));
    }
    const company = new Company({
        company_name,
        address: company_address
    });
    const newCompany = await company.save();

    const selectedData = {
        company_id: newCompany.id,
        company_name: newCompany.company_name,
        company_address: newCompany.address
    }

    return res.status(200).json({
        success: true,
        msg: "Company created successfully!",
        data: selectedData
    });
})


//@route    /api/companies
//@desc     GET:fetch all companies
//@access   public(optional protection given)
const getCompanies = asyncHandler(async (req, res, next) => {
    const companies = await Company.findAll({});

    if (!companies) {
        return next(new ErrorResponse('No Company Found!', 404));
    }

    return res.status(200).json({
        success: true,
        msg: "Company fetched successfully!",
        data: companies
    });
})


//@route    /api/companies/:id
//@desc     PATCH: update a company
//@access   protected by admin
const editCompany = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { company_name, company_address } = req.body;
    const company = await Company.findByPk(id);

    if (!company) {
        return next(new ErrorResponse('No Company Found to Update!', 404));
    }

    const updatedCompany = {};
    let isChanged = false;

    if (company_name?.trim() && company.company_name !== company_name) {
        updatedCompany.company_name = company_name.trim();
        isChanged = true;
    }
    if (company_address?.trim() && company.address !== company_address) {
        updatedCompany.address = company_address.trim();
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            msg: "Nothing Updated!",
            data: {
                id: company.id,
                company_name: company.company_name,
                company_address: company.address,
            }
        });
    }

    await company.update(updatedCompany);

    return res.status(200).json({
        success: true,
        msg: "Company updated successfully!",
        data: {
            id: company.id,
            company_name: company.company_name,
            company_address: company.address,
        }
    });
})


//@route    /api/company/:id/delete
//@desc     DELETE: delete a company Permanently
//@access   protected by admin
const deleteCompanyPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const company = await Company.findByPk(id);

    if (!company) {
        return next(new ErrorResponse('No company Found to Delete!', 404));
    }

    await company.destroy();

    return res.status(200).json({
        success: true,
        msg: `${company.company_name} deleted successfully!`,
    });
})


module.exports = {
    createCompany,
    getCompanies,
    editCompany,
    deleteCompanyPermanently
}