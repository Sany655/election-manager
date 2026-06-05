const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { User, VolunteerTeamMember, VolunteerTeam, Division, District, Upazilla, Union } = db;
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { model } = require("mongoose");
dayjs.extend(customParseFormat);
//@route    /api/vounteer-teams
//@desc     POST: create a new company
//@access   protected by admin
const createTeam = asyncHandler(async (req, res, next) => {
    console.log("createTeam called with body:", req.body);
    const {
        team_name,
        leader_id,
        description,
        type,
        location,
        status,
        division_id,
        district_id,
        upazilla_id,
        union_id
    } = req.body;

    // Check if policy already exists
    const isExist = await VolunteerTeam.findOne({ where: { name: team_name } });
    if (isExist) {
        return next(new ErrorResponse('Team already exists', 400));
    }

    // Create policy
    const newTeam = await VolunteerTeam.create({
        name: team_name,
        description,
        leader_id,
        type,
        location,
        status,
        division_id,
        district_id,
        upazilla_id,
        union_id,
        createdBy: req.user
    });

    // Select fields to return
    const selectedData = {
        team_name: newTeam.name,
        description: newTeam.description,
        type: newTeam.type,
        status: newTeam.status,
        location: newTeam.location,
        division_id: newTeam.division_id,
        district_id: newTeam.district_id,
        upazilla_id: newTeam.upazilla_id,
        union_id: newTeam.union_id
    };

    // Send response
    return res.status(200).json({
        success: true,
        msg: "Team created successfully!",
        data: selectedData
    });
});


//@route    /api/vounteer-teams
//@desc     GET:fetch all vounteer_team
//@access   public(optional protection given)
const getVolunteerTeams = asyncHandler(async (req, res, next) => {
    const vounteer_team = await VolunteerTeam.findAll({
        include: [
            {
                model: VolunteerTeamMember,
                as: "members",
                include: {
                    model: User,
                    as: "user",
                    attributes: ['id', 'name', 'msisdn']
                }
            },
            { model: Division, as: 'division', attributes: ['id', 'name', 'bn_name'] },
            { model: District, as: 'district', attributes: ['id', 'name', 'bn_name'] },
            { model: Upazilla, as: 'upazilla', attributes: ['id', 'name', 'bn_name'] },
            { model: Union, as: 'union', attributes: ['id', 'name', 'bn_name'] }
        ]
    });

    if (!vounteer_team) {
        return next(new ErrorResponse('No Team Found!', 404));
    }

    return res.status(200).json({
        success: true,
        msg: "Vounteer team fetched successfully!",
        data: vounteer_team
    });
})


//@route    /api/vounteer_team/:id
//@desc     PATCH: update a policy
//@access   protected by admin
const updateTeam = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const {
        team_name,
        description,
        type,
        status,
        division_id,
        district_id,
        upazilla_id,
        union_id
    } = req.body;

    const team = await VolunteerTeam.findByPk(id);
    if (!team) {
        return next(new ErrorResponse('No team found to update!', 404));
    }

    const updatedTeam = {};
    let isChanged = false;

    if (team_name?.trim() && team.name !== team_name.trim()) {
        updatedTeam.name = team_name.trim();
        isChanged = true;
    }

    if (description?.trim() && team.description !== description.trim()) {
        updatedTeam.description = description.trim();
        isChanged = true;
    }

    if (type?.trim() && team.type !== type.trim()) {
        updatedTeam.type = type.trim();
        isChanged = true;
    }

    if (status?.trim() && team.status !== status.trim()) {
        updatedTeam.status = status.trim();
        isChanged = true;
    }

    if (division_id && team.division_id !== division_id) {
        updatedTeam.division_id = division_id;
        isChanged = true;
    }
    if (district_id && team.district_id !== district_id) {
        updatedTeam.district_id = district_id;
        isChanged = true;
    }
    if (upazilla_id && team.upazilla_id !== upazilla_id) {
        updatedTeam.upazilla_id = upazilla_id;
        isChanged = true;
    }
    if (union_id && team.union_id !== union_id) {
        updatedTeam.union_id = union_id;
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            msg: "Nothing updated!",
            data: { id: team.id, team_name: team.name }
        });
    }

    await team.update(updatedTeam);

    return res.status(200).json({
        success: true,
        msg: "Team updated successfully!",
        data: {
            id: team.id,
            team_name: team.name
        }
    });
});



//@route    /api/vounteer_team/:id/delete
//@desc     DELETE: delete a team Permanently
//@access   protected by admin
const deleteTeam = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const team = await VolunteerTeam.findByPk(id);

    if (!team) {
        return next(new ErrorResponse('No team Found to Delete!', 404));
    }

    await team.destroy();

    return res.status(200).json({
        success: true,
        msg: `${team.name} deleted successfully!`,
    });
})


//@route    /api/vounteer-teams/assign
//@desc     POST: assign a team to user
//@access   protected by admin
const assignTeamMember = asyncHandler(async (req, res, next) => {
    const { user_ids, volunteer_team_id } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return next(new ErrorResponse('No users provided for assignment', 400));
    }

    // Get all existing vounteer_team for given users and policy ID
    const existingTeamMember = await VolunteerTeamMember.findAll({
        where: {
            volunteer_team_id,
            user_id: { [Op.in]: user_ids }
        },
        attributes: ['user_id']
    });

    const alreadyAssignedUserIds = existingTeamMember.map(p => p.user_id);

    // Filter out users who already have the policy assigned
    const filteredUserIds = user_ids.filter(id => !alreadyAssignedUserIds.includes(id));

    if (filteredUserIds.length === 0) {
        return next(new ErrorResponse('Team already assigned to all users!', 400));
    }

    // Prepare data for bulkCreate
    const teamData = filteredUserIds.map(user_id => ({
        user_id,
        volunteer_team_id,
    }));

    await VolunteerTeamMember.bulkCreate(teamData);

    return res.status(200).json({
        success: true,
        msg: `Team assigned successfully!`,
        newlyAssigned: filteredUserIds,
        alreadyAssigned: alreadyAssignedUserIds
    });
});




//@route    /api/vounteer-teams/remove-member
//@desc     POST: remove members from a team
//@access   protected by admin
const removeTeamMember = asyncHandler(async (req, res, next) => {
    const { user_ids, volunteer_team_id } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return next(new ErrorResponse('No users provided for removal', 400));
    }

    if (!volunteer_team_id) {
        return next(new ErrorResponse('Team ID is required', 400));
    }

    // Check if team exists
    const team = await VolunteerTeam.findByPk(volunteer_team_id);
    if (!team) {
        return next(new ErrorResponse('Team not found', 404));
    }

    // Remove members
    const deletedCount = await VolunteerTeamMember.destroy({
        where: {
            volunteer_team_id,
            user_id: { [Op.in]: user_ids }
        }
    });

    if (deletedCount === 0) {
        return next(new ErrorResponse('No matching members found to remove', 404));
    }

    return res.status(200).json({
        success: true,
        msg: `${deletedCount} member(s) removed successfully!`,
        removedIds: user_ids
    });
});

module.exports = {
    createTeam,
    getVolunteerTeams,
    updateTeam,
    deleteTeam,
    assignTeamMember,
    removeTeamMember
}
