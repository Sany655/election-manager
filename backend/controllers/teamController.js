const asyncHandler = require("../middleware/asyncHandler");
const db = require('../models/index');
const ErrorResponse = require("../utils/errorresponse");
const { Team } = db;


//@route    /api/teams
//@desc     POST: create a new team
//@access   protected by admin
const createTeam = asyncHandler(async (req, res, next) => {
    let { team_name, team_description, department_id, company_id } = req.body;

    // Trim input
    team_name = team_name?.trim();
    team_description = team_description?.trim();

    if (!team_name) {
        return next(new ErrorResponse('Team name is required', 400));
    }

    const isExist = await Team.findOne({ where: { name: team_name } });
    if (isExist) {
        return next(new ErrorResponse('Team already exists', 400));
    }

    const team = await Team.create({
        name: team_name,
        description: team_description || null,
        company_id: company_id || 1,
        department_id: department_id || 1,
    });

    const selectedData = {
        team_id: team.id,
        team_name: team.name,
        department_id: team.department_id,
        team_description: team.description,
    };

    return res.status(200).json({
        success: true,
        msg: "Team created successfully!",
        data: selectedData,
    });
});



//@route    /api/teams?department_id=1&company_id=1
//@desc     GET: Fetch all teams
//@access   Public (optional protection given)

const getTeams = asyncHandler(async (req, res, next) => {
    const { department_id, company_id, page = 1, limit = 10 } = req.query;

    const whereClause = {};
    if (department_id) whereClause.department_id = department_id;
    if (company_id) whereClause.company_id = company_id;

    const { count, rows } = await Team.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'name'],
        order: [['createdAt', 'DESC']],
        // limit: parseInt(limit),
        // offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return res.status(200).json({
        success: true,
        message: "Teams fetched successfully!",
        total: count,
        page: parseInt(page),
        perPage: parseInt(limit),
        data: rows,
    });
});



//@route    PATCH /api/teams/:id
//@desc     Update a team
//@access   Protected by admin

const editTeam = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { team_name, team_description,department_id, company_id  } = req.body;

    const team = await Team.findByPk(id);

    if (!team) {
        return next(new ErrorResponse('No team found to update!', 404));
    }

    const updatedFields = {};
    let isChanged = false;

    if (team_name?.trim() && team.name !== team_name.trim()) {
        updatedFields.name = team_name.trim();
        isChanged = true;
    }

    if (team_description?.trim() && team.description !== team_description.trim()) {
        updatedFields.description = team_description.trim();
        isChanged = true;
    }

    if (!isChanged) {
        return res.status(200).json({
            success: true,
            message: "Nothing updated!",
            data: {
                id: team.id,
                team_name: team.name,
                team_description: team.description,
            }
        });
    }

    await team.update(updatedFields);

    return res.status(200).json({
        success: true,
        message: "Team updated successfully!",
        data: {
            id: team.id,
            team_name: team.name,
            team_description: team.description,
        }
    });
});



//@route    /api/teams/:id/delete
//@desc     DELETE: delete a team Permanently
//@access   protected by admin
const deleteTeamPermanently = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const team = await Team.findByPk(id);

    if (!team) {
        return next(new ErrorResponse('No team Found to Delete!', 404));
    }

    await team.destroy();

    return res.status(200).json({
        success: true,
        msg: `${team.name} deleted successfully!`,
    });
})


module.exports = {
    createTeam,
    getTeams,
    editTeam,
    deleteTeamPermanently
}