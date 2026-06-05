const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { AttendencePolicy, AttendancePolicyHistory } = db;
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
//@route    /api/policies
//@desc     POST: create a new company
//@access   protected by admin
const createPolicy = asyncHandler(async (req, res, next) => {
    const {
        policy_name,
        working_days,
        off_days,
        work_start_time,
        work_end_time,
        late_grace_period,
        overtime_threshold
    } = req.body;

    // Check if policy already exists
    const isExist = await AttendencePolicy.findOne({ where: { name: policy_name } });
    if (isExist) {
        return next(new ErrorResponse('Policy already exists', 400));
    }

    // Validate time format (optional but recommended)
    const isStartTimeValid = dayjs(work_start_time, 'HH:mm:ss', true).isValid();
    const isEndTimeValid = dayjs(work_end_time, 'HH:mm:ss', true).isValid();
    if (!isStartTimeValid || !isEndTimeValid) {
        return next(new ErrorResponse('Invalid time format. Use HH:mm:ss', 400));
    }

    // Create policy
    const newPolicy = await AttendencePolicy.create({
        name: policy_name,
        working_days,
        off_days,
        work_start_time: dayjs(work_start_time, 'HH:mm:ss').format('HH:mm:ss'),
        work_end_time: dayjs(work_end_time, 'HH:mm:ss').format('HH:mm:ss'),
        late_grace_period,
        overtime_threshold
    });

    // Select fields to return
    const selectedData = {
        policy_name: newPolicy.name,
        working_days: newPolicy.working_days,
        off_days: newPolicy.off_days,
        work_start_time: newPolicy.work_start_time,
        work_end_time: newPolicy.work_end_time,
        late_grace_period: newPolicy.late_grace_period,
        overtime_threshold: newPolicy.overtime_threshold,
    };

    // Send response
    return res.status(200).json({
        success: true,
        msg: "Attendance Policy created successfully!",
        data: selectedData
    });
});


//@route    /api/policies
//@desc     GET:fetch all policies
//@access   public(optional protection given)
const getPolicies = asyncHandler(async (req, res, next) => {
    const policies = await AttendencePolicy.findAll({});

    if (!policies) {
        return next(new ErrorResponse('No Policy Found!', 404));
    }

    return res.status(200).json({
        success: true,
        msg: "Policies fetched successfully!",
        data: policies
    });
})


//@route    /api/policies/:id
//@desc     PATCH: update a policy
//@access   protected by admin
const editPolicy = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const {
        policy_name,
        working_days,
        off_days,
        work_start_time,
        work_end_time,
        late_grace_period,
        overtime_threshold
    } = req.body;

    const policy = await AttendencePolicy.findByPk(id);
    if (!policy) {
        return next(new ErrorResponse('No policy found to update!', 404));
    }

    const updatedPolicy = {};
    let isChanged = false;

    if (policy_name?.trim() && policy.name !== policy_name.trim()) {
        updatedPolicy.name = policy_name.trim();
        isChanged = true;
    }

    if (Array.isArray(working_days) && JSON.stringify(policy.working_days) !== JSON.stringify(working_days)) {
        updatedPolicy.working_days = working_days;
        isChanged = true;
    }

    if (Array.isArray(off_days) && JSON.stringify(policy.off_days) !== JSON.stringify(off_days)) {
        updatedPolicy.off_days = off_days;
        isChanged = true;
    }

    if (work_start_time && policy.work_start_time !== work_start_time) {
        updatedPolicy.work_start_time = work_start_time;
        isChanged = true;
    }

    if (work_end_time && policy.work_end_time !== work_end_time) {
        updatedPolicy.work_end_time = work_end_time;
        isChanged = true;
    }

    if (
        typeof late_grace_period === 'number' &&
        policy.late_grace_period !== late_grace_period
    ) {
        updatedPolicy.late_grace_period = late_grace_period;
        isChanged = true;
    }

    if (
        typeof overtime_threshold === 'number' &&
        policy.overtime_threshold !== overtime_threshold
    ) {
        updatedPolicy.overtime_threshold = overtime_threshold;
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            msg: "Nothing updated!",
            data: {
                id: policy.id,
                policy_name: policy.policy_name
            }
        });
    }

    await policy.update(updatedPolicy);

    return res.status(200).json({
        success: true,
        msg: "Policy updated successfully!",
        data: {
            id: policy.id,
            policy_name: policy.name
        }
    });
});



//@route    /api/policies/:id/delete
//@desc     DELETE: delete a policy Permanently
//@access   protected by admin
const deletePolicyPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const policy = await AttendencePolicy.findByPk(id);

    if (!policy) {
        return next(new ErrorResponse('No policy Found to Delete!', 404));
    }

    await policy.destroy();

    return res.status(200).json({
        success: true,
        msg: `${policy.name} deleted successfully!`,
    });
})


//@route    /api/policies/assign
//@desc     POST: assign a policy to user
//@access   protected by admin
const assignPolicy = asyncHandler(async (req, res, next) => {
    try {
        const { user_ids, task_id } = req.body;

        if (!Array.isArray(user_ids) || user_ids.length === 0) {
            return next(new ErrorResponse('No users provided for assignment', 400));
        }

        // Get all existing policies for given users and policy ID
        const existingPolicies = await AttendancePolicyHistory.findAll({
            where: {
                attendence_policy_id: task_id,
                user_id: { [Op.in]: user_ids }
            },
            attributes: ['user_id']
        });

        const alreadyAssignedUserIds = existingPolicies.map(p => p.user_id);

        // Filter out users who already have the policy assigned
        const filteredUserIds = user_ids.filter(id => !alreadyAssignedUserIds.includes(id));

        if (filteredUserIds.length === 0) {
            return next(new ErrorResponse('Attendance policy already assigned to all users!', 400));
        }

        // Prepare data for bulkCreate
        const policyData = filteredUserIds.map(user_id => ({
            user_id,
            attendence_policy_id: task_id,
            start_date: null,
            end_date: null
        }));

        await AttendancePolicyHistory.bulkCreate(policyData);

        return res.status(200).json({
            success: true,
            msg: `Task assigned successfully!`,
            newlyAssigned: filteredUserIds,
            alreadyAssigned: alreadyAssignedUserIds
        });
    } catch (error) {
        console.log(error);

    }
});



module.exports = {
    createPolicy,
    getPolicies,
    editPolicy,
    deletePolicyPermanently,
    assignPolicy
}