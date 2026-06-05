const fs = require('fs');
const path = require('path');
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorresponse");
const db = require('../models/index');
const { User, Role, UserRole, Attendence, AttendencePolicy, Permission, sequelize, RolePermission, UserPersonalDetails, UserDocument, Department, Designation, Division, District, Upazilla, Union } = db;
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const ExcelProcessor = require('../utils/excelProcessor');
const DataUploader = require('../utils/dataUploader');
const { ExcelExportService } = require('../services');
//@desc     Get all users (with optional role filter)
//@route    GET /api/users?role=user
//@access   Public
const getAll = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 0;
    const offset = perPage > 0 ? (page - 1) * perPage : 0;
    const currentUserRole = req.user?.roles?.[0]?.name || 'user'; // Default to 'user' if no role found
    // Extract search parameters
    const {
        name,
        role,
        exclude_role,
        employee_id,
        division_id,
        district_id,
        upazilla_id,
        union_id,
        ward,
        email,
        phone,
        status,
        search,
        hasFingerprint,
        format
    } = req.query;

    // Build where conditions for User model
    const userWhereConditions = {};

    // Name search (case-insensitive partial match)
    if (name) {
        userWhereConditions.name = {
            [Op.like]: `%${name}%`
        };
    }

    // Employee ID search (exact match or partial)
    if (employee_id) {
        userWhereConditions.employee_id = {
            [Op.like]: `%${employee_id}%`
        };
    }

    // Division search
    if (division_id) {
        userWhereConditions.division_id = division_id;
    }

    if (district_id) {
        userWhereConditions.district_id = district_id;
    }

    if (upazilla_id) {
        userWhereConditions.upazilla_id = upazilla_id;
    }

    if (union_id) {
        userWhereConditions.union_id = union_id;
    }

    if (ward) {
        userWhereConditions.ward = ward;
    }

    // Email search (case-insensitive partial match)
    if (email) {
        userWhereConditions.email = {
            [Op.like]: `%${email}%`
        };
    }

    // Phone search (partial match) - using msisdn field
    if (phone) {
        userWhereConditions.msisdn = {
            [Op.like]: `%${phone}%`
        };
    }

    // Status filter (boolean conversion)
    if (status) {
        if (status === 'active' || status === 'true' || status === true) {
            userWhereConditions.isActive = true;
        } else if (status === 'inactive' || status === 'false' || status === false) {
            userWhereConditions.isActive = false;
        }
    }

    // Fingerprint filter
    if (hasFingerprint !== undefined) {
        if (hasFingerprint === 'true' || hasFingerprint === true || hasFingerprint === '1') {
            // Users with fingerprint (fingerprint_template is not null)
            userWhereConditions.fingerprint_template = {
                [Op.not]: null
            };
        } else if (hasFingerprint === 'false' || hasFingerprint === false || hasFingerprint === '0') {
            // Users without fingerprint (fingerprint_template is null)
            userWhereConditions.fingerprint_template = {
                [Op.is]: null
            };
        }
    }

    // Generic search across multiple fields
    if (search) {
        userWhereConditions[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { employee_id: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { msisdn: { [Op.like]: `%${search}%` } }
        ];
    }

    // Role filter conditions
    let roleWhereConditions = {};

    if (role) {
        roleWhereConditions.name = role;
    } else {
        const notRoles = [];

        // Handle normal user exclusion logic
        if (currentUserRole !== 'super-admin') {
            notRoles.push('super-admin');
            notRoles.push('user');
        }

        // Handle explicit exclusion
        if (exclude_role) {
            notRoles.push(exclude_role);
        }

        if (notRoles.length > 0) {
            roleWhereConditions.name = {
                [Op.notIn]: notRoles
            };
        }
    }

    try {
        // Build query options
        const queryOptions = {
            where: userWhereConditions,
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                    where: roleWhereConditions,
                    required: !!(role || exclude_role), // true if filtering or excluding specific roles
                },
                {
                    model: Designation,
                    as: 'designation',
                    attributes: ['name'],
                    required: false
                },
                {
                    model: Division,
                    as: 'division',
                    attributes: ['name', 'bn_name'],
                    required: false
                },
                {
                    model: District,
                    as: 'district',
                    attributes: ['name', 'bn_name'],
                    required: false
                },
                {
                    model: Upazilla,
                    as: 'upazilla',
                    attributes: ['name', 'bn_name'],
                    required: false
                },
                {
                    model: Union,
                    as: 'union',
                    attributes: ['name', 'bn_name'],
                    required: false
                },
            ],
            attributes: {
                exclude: ['password', 'updatedAt',]
            },
            distinct: true,
            // order: [['createdAt']]
        };

        // For Excel export, don't apply pagination to get all data
        if (format?.toLowerCase() !== 'excel') {
            queryOptions.offset = offset;
            if (perPage > 0) {
                queryOptions.limit = perPage;
            }
        }

        const { count, rows } = await User.findAndCountAll(queryOptions);

        // Transform data to flatten relationships and prepare for export
        const data = rows.map(user => {
            const u = user.toJSON();
            return {
                // ...u,
                // Flatten related data for better Excel export
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                employee_id: u.employee_id,
                roles: u.roles,
                designation_name: u.designation?.name || 'No Designation',
                designation_id: u.designation_id,
                department_id: u.department_id,
                joining_date: u.joining_date,
                division_name: u.division?.name || 'No Division',
                district_name: u.district?.name || 'No District',
                upazilla_name: u.upazilla?.name || 'No Upazilla',
                union_name: u.union?.name || 'No Union',
                ward: u.ward || 'No Ward',
                isActive: u.isActive,
                // // Remove nested objects for cleaner data
                hasFingerprint: !!u.fingerprint_template,
                // hasFingerprint: !!u.fingerprint_template,
                msisdn: u.msisdn || null,
                division_id: u.division_id,
                district_id: u.district_id,
                upazilla_id: u.upazilla_id,
                union_id: u.union_id,
                ward: u.ward,
                // team: undefined,
                // location: undefined,
                // area: undefined,
                // territory: undefined,
            };
        });

        // Handle Excel export
        if (format?.toLowerCase() === 'excel') {
            return await handleExcelExport(res, data, {
                filters: req.query,
                totalCount: count
            });
        }

        // Regular JSON response with pagination
        return res.status(200).json({
            success: true,
            page,
            pages: perPage > 0 ? Math.ceil(count / perPage) : 1,
            count,
            data,
            filters: {
                name,
                role,
                employee_id,
                division_id,
                district_id,
                upazilla_id,
                union_id,
                ward,
                email,
                phone,
                status,
                hasFingerprint,
                search
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});


async function handleExcelExport(res, data, options) {
    try {
        const reportData = data.data || data;

        // const { startDate, endDate } = options || {};
        // const formattedStart = DateUtils.formatDate(startDate, 'YYYY-MM-DD');
        // const formattedEnd = DateUtils.formatDate(endDate, 'YYYY-MM-DD');

        const filename = `users_report.xlsx`;

        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const workbook = await ExcelExportService.generateUsersExcel(reportData, options);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        throw new ErrorResponse(`Excel export failed: ${error.message}`);
    }
}


//@desc     Get all users (with optional role filter)
//@route    GET /api/users/fingerprints
//@access   Protected
const getAllFingerprints = asyncHandler(async (req, res, next) => {
    const roleFilter = req.query.role;

    const whereClause = {
        isActive: 1,
        fingerprint_template: {
            [Op.ne]: null // Not null
        }
    };
    if (roleFilter) {
        whereClause.role = roleFilter;
    }

    const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        // limit: perPage,
        // offset,
        attributes: ['id', 'name', 'employee_id', 'fingerprint_template'],
    });

    if (!rows || rows.length === 0) {
        return next(new ErrorResponse('Users not found or No fingerprint assigned', 404));
    }

    // Convert buffer to base64 string
    const processedData = rows.map(user => {
        const json = user.toJSON();
        const fingerprintBuffer = user.fingerprint_template;

        return {
            ...json,
            fingerprint_template: fingerprintBuffer
                ? Buffer.from(fingerprintBuffer).toString('base64')
                : null
        };
    });


    return res.status(200).json({
        success: true,
        count,
        data: processedData,
    });
});

//@desc     get one by user id or employee_id
//@route    GET     /api/users/:id
//@access   public
const getOne = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findOne({
        where: {
            [Op.or]: [
                { id },
                { employee_id: id }
            ]
        },
        include: [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            },
            {
                model: Attendence,
                as: 'attendances',
                attributes: ['company_attendence_policy_id'],
                include: {
                    model: AttendencePolicy,
                    as: 'attendence_policy',
                    attributes: ['name', 'working_days', 'off_days']
                },
                required: false,
            },
            {
                model: Designation,
                as: 'designation',
                attributes: ['name'],
                required: false
            },
            {
                model: Division,
                as: 'division',
                attributes: ['name', 'bn_name'],
                required: false
            },
            {
                model: District,
                as: 'district',
                attributes: ['name', 'bn_name'],
                required: false
            },
            {
                model: Upazilla,
                as: 'upazilla',
                attributes: ['name', 'bn_name'],
                required: false
            },
            {
                model: Union,
                as: 'union',
                attributes: ['name', 'bn_name'],
                required: false
            },
            {
                model: UserDocument,
                as: 'documents',
                attributes: ['image', 'cv', 'nid', 'job_clearance', 'educational_docs', 'guarantor_docs', 'parents_nid'],
                required: false
            },
            {
                model: UserPersonalDetails,
                as: 'personalDetails',
                attributes: { exclude: ['id', 'user_id', 'createdAt', 'updatedAt'] },
                required: false
            }
        ],
        attributes: [
            'id', 'employee_id', 'name', 'email', 'msisdn', 'isActive',
            'gender', 'avatar', 'joining_date', 'createdAt',
            'division_id', 'district_id', 'upazilla_id', 'union_id', 'ward'
        ],
    });

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const userJson = user.toJSON();

    // Simple flat structure with only names
    const result = {
        ...userJson,
        designation_name: userJson.designation?.name || null,
        division_name: userJson.division?.name || null,
        district_name: userJson.district?.name || null,
        upazilla_name: userJson.upazilla?.name || null,
        union_name: userJson.union?.name || null,
        ward: userJson.ward || null,
        attendance: userJson.attendances?.[0] || null,
    };
    // Clean up the original nested objects if you don't want them
    delete result.attendances;
    delete result.designation;
    delete result.division;
    delete result.district;
    delete result.upazilla;
    delete result.union;

    return res.status(200).json({
        success: true,
        data: result
    });
});


//@route    /api/users/register
//@desc     register a user
//@access   protected
const register = asyncHandler(async (req, res, next) => {
    const isExist = await User.findOne({ where: { email: req.body.email } }); //@or msisdn
    if (isExist) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }
        return next(new ErrorResponse('User Already Exist', 400));
    }


    const user = await User.create({
        ...req.body,
        isActive: req.body.status ?? 0,
        avatar: req.file ? req.file.path.replace(/\\/g, "/") : null,
        createdBy: req.user.id,
    });

    if (user) {
        //asing role to the created user
        const userRole = await UserRole.create({
            user_id: user.id,
            role_id: req.body.role
        });

        return res.status(201).json({
            success: true,
            msg: 'User Creation Successful!',
            data: user,
            // token: user.getSignedJwtToken(),
        });
    }
    else {
        return next(new ErrorResponse('Invalid Data', 400));
    }
})

//@route    /api/users/register-employee
//@desc     register-employee
//@access   protected
const registerEmployee = asyncHandler(async (req, res, next) => {

    try {
        const isExist = await User.findOne({ where: { employee_id: req.body.employee_id } });
        if (isExist) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
            return next(new ErrorResponse('User Already Exist', 400));
        }

        if (req.body.email) {
            const isEmailExist = await User.findOne({ where: { email: req.body.email } });
            if (isEmailExist) {
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        }
                    });
                }
                return next(new ErrorResponse('User with this email already exists', 400));
            }
        }

        const user = await User.create({
            ...req.body,
            email: req.body.email || null, // Handle empty string email
            isActive: req.body.status ?? 1,
            avatar: req.file ? req.file.path.replace(/\\/g, "/") : null,
            createdBy: req.user.id,
        });

        if (user) {
            //asing role to the created user
            const userRole = await UserRole.create({
                user_id: user.id,
                role_id: req.body.role
            });

            //asign policy to the user
            // const existPolicy = await AttendancePolicyHistory.findOne({
            //     where: { [Op.and]: [{ attendence_policy_id: req.body.attendence_policy_id }, { user_id: user.id }] }
            // });

            // if (existPolicy) {
            //     return next(new ErrorResponse('Attendance policy already assigned!', 400));
            // }
            // const policyData = {
            //     user_id: user.id,
            //     attendence_policy_id: req.body.attendence_policy_id,
            //     start_date: new Date(req.body.start_date) ,
            //     end_date: new Date(req.body.end_date)
            // };


            // const newPolicyData = await AttendancePolicyHistory.create(policyData);

            // pick only selected fields to return
            const selectedUserData = {
                name: user.name,
                email: user.email,
                employee_id: user.employee_id,
                avatar: user.avatar,
                status: user.isActive,
                // attendence_policy_id: newPolicyData.attendence_policy_id,
            };

            return res.status(201).json({
                success: true,
                msg: 'User Creation Successful!',
                data: selectedUserData,
                // token: user.getSignedJwtToken(),
            });
        }
        else {
            return next(new ErrorResponse('Invalid Data', 400));
        }
    } catch (error) {
        console.log(error.message);
        return next(new ErrorResponse(error.message, error.status || 500));
    }
})

//@route    /api/users/employee/:id
//@desc     PATCH: update a user
//@access   protected by admin
const editEmployee = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.params.id, {
        include: [
            {
                model: UserPersonalDetails,
                as: 'personalDetails',
                required: false
            },
            {
                model: UserDocument,
                as: 'documents',
                required: false
            }
        ]
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            msg: 'No User Found to Update!'
        });
    }

    // Extract data from request body
    const {
        // Core user fields
        employee_id,
        name,
        email,
        password,
        msisdn,
        company_id,
        location_id,
        // area_id, // Removed
        department_id,
        // team_id, // Removed
        region_id,
        // territory_id, // Removed
        designation_id,
        joining_date,
        status,
        role,

        // New location fields
        division_id,
        district_id,
        upazilla_id,
        union_id,
        ward,

        // Personal details fields
        dob,
        blood_group,
        marital_status,
        identification_type,
        identification_no,
        disability,
        total_experience,
        account_type,
        account_no,
        rff_point,
        rff_sub_code,
        emergency_contact_phone,
        present_address,
        permanent_address
    } = req.body;

    // Start transaction for data consistency
    const transaction = await sequelize.transaction();

    try {
        // 1. Prepare core user data updates
        const userUpdateData = {};

        // Only update fields that are provided
        if (employee_id !== undefined) userUpdateData.employee_id = employee_id;
        if (name !== undefined) userUpdateData.name = name;
        if (email !== undefined) userUpdateData.email = email || null; // Handle empty string email
        if (msisdn !== undefined) userUpdateData.msisdn = msisdn;
        if (company_id !== undefined) userUpdateData.company_id = company_id;
        if (location_id !== undefined) userUpdateData.location_id = location_id;
        // if (area_id !== undefined) userUpdateData.area_id = area_id;
        if (department_id !== undefined) userUpdateData.department_id = department_id;
        // if (team_id !== undefined) userUpdateData.team_id = team_id;
        if (region_id !== undefined) userUpdateData.region_id = region_id;
        // if (territory_id !== undefined) userUpdateData.territory_id = territory_id;
        if (division_id !== undefined) userUpdateData.division_id = division_id;
        if (district_id !== undefined) userUpdateData.district_id = district_id;
        if (upazilla_id !== undefined) userUpdateData.upazilla_id = upazilla_id;
        if (union_id !== undefined) userUpdateData.union_id = union_id;
        if (ward !== undefined) userUpdateData.ward = ward;
        if (rff_point !== undefined) userUpdateData.rff_point_id = rff_point;
        if (designation_id !== undefined) userUpdateData.designation_id = designation_id;
        if (joining_date !== undefined) userUpdateData.joining_date = joining_date;
        if (status !== undefined) userUpdateData.isActive = status;

        // Handle password update (hash if provided)
        if (password && password.trim() !== '') {
            userUpdateData.password = password;
        }

        // 2. Handle file uploads
        const documentUpdates = {};

        if (req.files) {
            // Handle multiple file uploads
            Object.keys(req.files).forEach(fieldName => {
                const file = req.files[fieldName][0]; // Get first file if multiple
                if (file) {
                    const filePath = file.path.replace(/\\/g, "/");

                    // Handle profile image separately (goes to users table)
                    if (fieldName === 'image' || fieldName === 'avatar') {
                        // Delete old image if exists
                        if (user.avatar) {
                            const oldImagePath = path.join(path.resolve(), user.avatar);
                            fs.unlink(oldImagePath, (err) => {
                                if (err) console.error('Failed to delete old image:', err);
                            });
                        }
                        userUpdateData.avatar = filePath;
                    } else {
                        // Other documents go to employee_documents table
                        documentUpdates[fieldName] = filePath;

                        // Delete old document if exists
                        if (user.documents && user.documents[fieldName]) {
                            const oldDocPath = path.join(path.resolve(), user.documents[fieldName]);
                            fs.unlink(oldDocPath, (err) => {
                                if (err) console.error(`Failed to delete old ${fieldName}:`, err);
                            });
                        }
                    }
                }
            });
        } else if (req.file) {
            // Handle single file upload (backward compatibility)
            if (user.avatar) {
                const oldImagePath = path.join(path.resolve(), user.avatar);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Failed to delete old image:', err);
                });
            }
            userUpdateData.avatar = req.file.path.replace(/\\/g, "/");
        }

        // 3. Update core user data
        const updatedUser = await user.update(userUpdateData, { transaction });

        // 4. Update or create personal details
        const personalDetailsData = {};
        if (dob !== undefined) personalDetailsData.dob = dob;
        if (blood_group !== undefined) personalDetailsData.blood_group = blood_group;
        if (marital_status !== undefined) personalDetailsData.marital_status = marital_status;
        if (identification_type !== undefined) personalDetailsData.identification_type = identification_type;
        if (identification_no !== undefined) personalDetailsData.identification_no = identification_no;
        if (disability !== undefined) personalDetailsData.disability = disability;
        if (total_experience !== undefined) personalDetailsData.total_experience = total_experience;
        if (account_type !== undefined) personalDetailsData.account_type = account_type;
        if (account_no !== undefined) personalDetailsData.account_no = account_no;
        if (rff_point !== undefined) personalDetailsData.rff_point = rff_point;
        if (rff_sub_code !== undefined) personalDetailsData.rff_sub_code = rff_sub_code;
        if (emergency_contact_phone !== undefined) personalDetailsData.emergency_contact_phone = emergency_contact_phone;
        if (present_address !== undefined) personalDetailsData.present_address = present_address;
        if (permanent_address !== undefined) personalDetailsData.permanent_address = permanent_address;

        // Update personal details if any data provided
        if (Object.keys(personalDetailsData).length > 0) {
            await UserPersonalDetails.upsert({
                user_id: user.id,
                ...personalDetailsData
            }, { transaction });
        }

        // 5. Update documents if any files uploaded
        if (Object.keys(documentUpdates).length > 0) {
            await UserDocument.upsert({
                user_id: user.id,
                ...documentUpdates
            }, { transaction });
        }

        // 6. Handle role assignment if provided
        if (role) {
            // Remove existing roles
            await user.setRoles([], { transaction });
            // Add new role
            await user.addRole(role, { transaction });
        }

        // Commit transaction
        await transaction.commit();

        // 7. Fetch updated user with all relations
        const completeUpdatedUser = await User.findByPk(user.id, {
            include: [
                {
                    model: UserPersonalDetails,
                    as: 'personalDetails'
                },
                {
                    model: UserDocument,
                    as: 'documents'
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name']
                },
                {
                    model: Division,
                    as: 'division',
                    attributes: ['id', 'name']
                },
                {
                    model: District,
                    as: 'district',
                    attributes: ['id', 'name']
                },
                {
                    model: Upazilla,
                    as: 'upazilla',
                    attributes: ['id', 'name']
                },
                {
                    model: Union,
                    as: 'union',
                    attributes: ['id', 'name']
                },
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ],
            attributes: { exclude: ['password'] } // Don't return password
        });

        return res.status(200).json({
            success: true,
            msg: 'Employee updated successfully!',
            data: completeUpdatedUser
        });

    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();

        console.error('Error updating employee:', error);
        return res.json({ success: false, error: 'Failed to update employee' + error.message }, { status: 500 });
    }
});


//@route    /api/users/register-fingerprint
//@desc     register-fingerprint
//@access   public
const registerEmployeeFingerprint = asyncHandler(async (req, res, next) => {
    const { employee_id, fingerprint_template } = req.body;

    const existUser = await User.findOne({ where: { employee_id, isActive: 1 } });
    if (!existUser) {
        return next(new ErrorResponse('User Not Registered yet or Inactive !', 400));
    }

    // Enhanced fingerprint template validation
    if (!fingerprint_template || typeof fingerprint_template !== 'string') {
        return next(new ErrorResponse('Fingerprint template is required and must be a string', 400));
    }

    const trimmedTemplate = fingerprint_template.trim();

    // Check if it's valid base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmedTemplate)) {
        return next(new ErrorResponse('Invalid fingerprint template format - must be base64 encoded', 400));
    }

    // Check minimum length
    if (trimmedTemplate.length < 100) {
        return next(new ErrorResponse('Invalid Fingerprint! Fingerprint template too short - please rescan', 400));
    }

    // Check for empty/invalid fingerprint patterns
    if (trimmedTemplate.match(/^A+={0,2}$/)) {
        return next(new ErrorResponse('Invalid Fingerprint! Please clean your finger and scanner, then rescan.', 400));
    }

    // Validate the actual base64 content
    try {
        const buffer = Buffer.from(trimmedTemplate, 'base64');

        // Check if buffer is too small
        if (buffer.length < 50) {
            return next(new ErrorResponse('Invalid fingerprint! - template too small', 400));
        }

        // Check for empty fingerprint data (all zeros)
        const isEmptyFingerprint = buffer.every(byte => byte === 0);
        if (isEmptyFingerprint) {
            return next(new ErrorResponse('Invalid Fingerprint! Empty fingerprint template - contains no biometric data. Please rescan fingerprint.', 400));
        }

        // Check for very low entropy (mostly repeated patterns)
        const uniqueBytes = new Set(buffer);
        if (uniqueBytes.size < 10) {
            return next(new ErrorResponse('Invalid Fingerprint! Please rescan ', 400));
        }

        // Check if fingerprint already registered (using the buffer for comparison)
        const isFingerprintExist = await User.findOne({
            where: {
                fingerprint_template: buffer,
                employee_id: { [Op.ne]: employee_id } // Exclude current user
            }
        });

        if (isFingerprintExist) {
            return next(new ErrorResponse('This fingerprint is already registered to another user!', 400));
        }

        // Update user with the buffer
        const updatedUser = await existUser.update({
            fingerprint_template: buffer
        });

        if (updatedUser) {
            // Pick only selected fields to return
            const selectedUserData = {
                name: updatedUser.name,
                email: updatedUser.email,
                employee_id: updatedUser.employee_id,
                avatar: updatedUser.avatar,
                status: updatedUser.isActive,
                fingerprint_registered: true, // Don't return the actual template for security
            };

            return res.status(201).json({
                success: true,
                msg: 'Fingerprint Updated Successfully!',
                data: selectedUserData,
            });
        } else {
            return next(new ErrorResponse('Failed to update fingerprint', 500));
        }

    } catch (error) {
        return next(new ErrorResponse('Invalid base64 fingerprint template', 400));
    }
});



//@desc     get auth user with employee_id/email and password
//@route    POST     /api/users/login
//@access   public
const login = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findOne({

            where: { email: req.body.email },

            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] },
                include: {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            },
            ]
        })

        if (user && (await user.matchPassword(req.body.password))) {
            return res.status(200).json({
                success: true,
                msg: 'Login Successful!',
                token: user.getSignedJwtToken(),
                data: user,
            });

        }
        else {
            return next(new ErrorResponse(`Invalid email or password`, 401));
        }
    } catch (error) {
        return next(new ErrorResponse(error.message, 500));
    }
});

//@desc     get profile
//@route    GET     /api/users/me
//@access   private
const getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id, {
        include: [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] },
                include: {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            },
            {
                model: UserPersonalDetails,
                as: 'personalDetails',
                required: false
            },
            {
                model: Designation,
                as: 'designation',
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: Department,
                as: 'department',
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: Division,
                as: 'division',
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: District,
                as: 'district',
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: Upazilla,
                as: 'upazilla',
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: Union,
                as: 'union',
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: UserDocument,
                as: 'documents',
                required: false
            }
        ],
        attributes: {
            exclude: ['password', 'updatedAt']
        },
    });

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }
    return res.status(200).json({
        success: true,
        msg: 'Profile fetched successfully!',
        data: user,
    });
});


//@route    /api/users/:id/delete
//@desc     DELETE: delete a user
//@access   protected by admin
const deleteUserPermanently = asyncHandler(async (req, res, next) => {

    const user = await User.findByPk(req.params.id);

    if (!user) {
        return next(new ErrorResponse('No user Found to Delete!', 404));
    }

    if (user.avatar) {
        const __dirname = path.resolve();
        const imagePath = path.join(__dirname, user.avatar);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Failed to delete image: ${imagePath}`, err);
                return next(new ErrorResponse('Failed to delete user image.', 500));
            }
        });
    }

    await user.destroy();

    return res.status(200).json({
        success: true,
        msg: "User deleted successfully!",
    });
})

//@desc     get all
//@route    GET     /api/users/roles
//@access   protected by admin/s-admin
const getAllRoles = asyncHandler(async (req, res, next) => {
    const roleIds = req.user.roles.map(r => r.id);
    const hasSuperAdminRole = roleIds.includes(1); // Super Admin
    const hasAdminRole = roleIds.includes(2); // Admin

    let whereClause = {};

    if (hasSuperAdminRole) {
        // Super Admin (role_id 1) can see ALL roles
        whereClause = {};
    } else if (hasAdminRole) {
        // Admin (role_id 2) can see all roles EXCEPT Super Admin (role_id 1)
        whereClause = {
            id: {
                [Op.ne]: 1
            }
        };
    } else {
        // Other users can only see their own roles or implement your business logic
        whereClause = {
            id: {
                [Op.in]: roleIds
            }
        };
    }

    const data = await Role.findAll({
        where: whereClause,
        attributes: ['id', 'name'],
        include: [
            {
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }
        ],
    });

    if (!data || data.length === 0) {
        return next(new ErrorResponse('No roles found', 404));
    }

    return res.status(200).json({
        success: true,
        data,
    });
});


//@route    /api/users/roles
//@desc     POST: create a new role
//@access   protected by admin
const createRole = asyncHandler(async (req, res, next) => {
    const { role_name, permission_ids } = req.body;

    const isExist = await Role.findOne({ where: { name: role_name } });
    if (isExist) {
        return next(new ErrorResponse('Role already exists', 400));
    }

    // Create new role
    const newRole = await Role.create({ name: role_name });

    // Validate and assign permissions
    if (newRole && Array.isArray(permission_ids) && permission_ids.length > 0) {
        // Fetch valid permissions
        const validPermissions = await Permission.findAll({
            where: {
                id: {
                    [Op.in]: permission_ids
                }
            }
        });

        if (validPermissions.length === 0) {
            return next(new ErrorResponse('No valid permissions found to assign', 400));
        }

        // Create entries in RolePermission table
        const rolePermissions = validPermissions.map(permission => ({
            role_id: newRole.id,
            permission_id: permission.id
        }));

        await RolePermission.bulkCreate(rolePermissions);
    }

    return res.status(200).json({
        success: true,
        msg: "Role created successfully!",
        data: {
            role_id: newRole.id,
            role_name: newRole.name
        }
    });
});

//@route    PUT /api/users/roles/:id
//@desc     Update role name and assigned permissions
//@access   Protected by admin

const editRole = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { role_name, permission_ids } = req.body;

    if (!role_name) {
        return next(new ErrorResponse("Role name is required", 400));
    }

    // Check if role exists
    const role = await Role.findByPk(id);
    if (!role) {
        return next(new ErrorResponse("Role not found", 404));
    }

    // Check for duplicate role name (excluding current role)
    const existingRole = await Role.findOne({
        where: {
            name: role_name,
            id: { [Op.ne]: id }
        }
    });

    if (existingRole) {
        return next(new ErrorResponse("Role name already exists", 400));
    }

    // Update role name
    role.name = role_name;
    await role.save();

    // If permission_ids are provided, update role-permission mapping
    if (Array.isArray(permission_ids)) {
        // Clear existing permissions
        await RolePermission.destroy({ where: { role_id: id } });

        // Validate permissions exist
        const validPermissions = await Permission.findAll({
            where: {
                id: { [Op.in]: permission_ids }
            }
        });

        if (validPermissions.length === 0 && permission_ids.length > 0) {
            return next(new ErrorResponse("No valid permissions found to assign", 400));
        }

        // Create new entries
        const newMappings = validPermissions.map(p => ({
            role_id: id,
            permission_id: p.id
        }));

        if (newMappings.length > 0) {
            await RolePermission.bulkCreate(newMappings);
        }
    }

    return res.status(200).json({
        success: true,
        msg: "Role updated successfully!",
        data: {
            role_id: role.id,
            role_name: role.name,
            updated_permissions: permission_ids || []
        }
    });
});


//@route    /api/users/roles/:id/delete
//@desc     DELETE: delete a  role
//@access   protected by admin
const deleteRolePermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const role = await Role.findByPk(id);

    if (!role) {
        return next(new ErrorResponse('No Role Found to Delete!', 404));
    }

    if (role.name === 'super-admin' || role.name === 'admin') {
        return next(new ErrorResponse('Super Admin or Admin Role cannot be deleted!', 403));
    }

    await role.destroy();

    return res.status(200).json({
        success: true,
        msg: `${role.name} deleted successfully!`,
    });
})

//@desc     get all
//@route    GET     /api/users/permissions
//@access   protected by admin/s-admin
const getAllPermissions = asyncHandler(async (req, res, next) => {
    const roleIds = req.user.roles.map(r => r.id);
    const hasSuperAdminRole = roleIds.includes(1); // Check if user has admin role (role_id 1)
    let data;
    if (hasSuperAdminRole) {
        data = await Permission.findAll({ attributes: ['name', 'id'] });
        return res.status(200).json({
            success: true,
            data,
        });
    } else {
        // For other roles, only get permissions assigned to their roles
        data = await RolePermission.findAll({
            where: {
                role_id: {
                    [Op.in]: roleIds // Use Op.in for multiple role IDs
                }
            },
            include: [
                {
                    model: Permission,
                    attributes: ['name'],
                }
            ],
            attributes: ['role_id', 'permission_id'],
            raw: true
        });
    }

    // Transform the data to desired format
    const transformedData = data.map(item => ({
        id: item.permission_id,
        name: item['Permission.name'],
        // role_id: item.role_id
    }));

    return res.status(200).json({
        success: true,
        data: transformedData,
    });
});


//@route    /api/users/permissions
//@desc     POST: create a new permission
//@access   protected by admin
const createPermission = asyncHandler(async (req, res, next) => {
    const { permission_name } = req.body;

    const isExist = await Permission.findOne({ where: { name: permission_name } });
    if (isExist) {
        return next(new ErrorResponse('Permission Already Exist', 400));
    }
    const permission = new Permission({
        name: permission_name,
    });
    const newPermission = await permission.save();

    const selectedData = {
        permission_id: newPermission.id,
        permission_name: newPermission.name,
    }

    return res.status(200).json({
        success: true,
        msg: "Permission created successfully!",
        data: selectedData
    });
})

//@route    /api/users/permissions/:id/delete
//@desc     DELETE: delete a  permission
//@access   protected by admin
const deletPermissionPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const permission = await Permission.findByPk(id);

    if (!permission) {
        return next(new ErrorResponse('No Permission Found to Delete!', 404));
    }

    await permission.destroy();

    return res.status(200).json({
        success: true,
        msg: `${permission.name} deleted successfully!`,
    });
})


//@route    /api/users/employee/master-data/process
//@desc     PATCH: update a user
//@access   protected by admin
const processMasterData = asyncHandler(async (req, res, next) => {

    const excelFilePath = path.join(__dirname, '../uploads/documents/users_master_data/' + 'last1801-2006.xlsx');
    const processor = new ExcelProcessor(excelFilePath);

    if (!(await processor.loadWorkbook())) {
        throw new Error('Failed to load Excel workbook');
    }

    console.log('Available sheets:', processor.getSheetNames());

    // Analyze sheet structure
    // processor.analyzeSheet('MAIN DATABASE');
    processor.analyzeSheet('MAIN DATABASE');

    // Process the main database sheet
    const processedData = await processor.processMainDatabase();
    console.log(`✓ Processed ${processedData.length} employee records from Excel.`);
    const uploader = new DataUploader();
    const result = await uploader.uploadData(processedData);

    console.log('\n=== FINAL STATISTICS ===');
    console.log(`Total records processed: ${processedData.length}`);
    console.log(`Successfully uploaded: ${result.successCount}`);
    console.log(`Failed uploads: ${result.errorCount}`);

    return res.json({
        data: result
    });

});



module.exports = {
    getAll,
    getAllFingerprints,
    getOne,
    register,
    registerEmployee,
    registerEmployeeFingerprint,
    editEmployee,
    login,
    getProfile,
    deleteUserPermanently,
    getAllRoles,
    createRole,
    editRole,
    deleteRolePermanently,
    getAllPermissions,
    createPermission,
    deletPermissionPermanently,
    processMasterData
}