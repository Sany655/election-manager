const asyncHandler = require("../middleware/asyncHandler");
const { User, Voter, VoteCentre, Event, Role, Task, Union, SocialAnalytics, Sequelize } = require('../models');
// ... existing imports ...

// ... existing getDashboardStats function ...

//@route    GET /api/dashboard/volunteer-stats
//@desc     Get volunteer dashboard statistics
//@access   Private
const getVolunteerStats = asyncHandler(async (req, res) => {
    // 1. Volunteer Counts
    const volunteerRole = await Role.findOne({ where: { name: 'volunteer' } });
    let totalVolunteers = 0;
    let activeVolunteers = 0;

    if (volunteerRole) {
        const volunteers = await User.findAll({
            include: [{
                model: Role,
                as: 'roles',
                where: { id: volunteerRole.id }
            }],
            attributes: ['id', 'isActive']
        });
        totalVolunteers = volunteers.length;
        activeVolunteers = volunteers.filter(v => v.isActive).length;
    }

    // 2. Tasks
    // Check if Task model works, if not we handle gracefully
    let completedTasks = 0;
    let upcomingTasks = [];

    try {
        completedTasks = await Task.count({ where: { status: 'Completed' } });

        const now = new Date();
        upcomingTasks = await Task.findAll({
            where: {
                duetime: { [Op.gt]: now }
            },
            limit: 3,
            order: [['duetime', 'ASC']]
        });
    } catch (err) {
        console.error("Error fetching tasks:", err);
    }

    // 4. Weekly Activity (Mock for now as we don't have task history easily accessible)
    const activityData = [
        { day: 'Mon', volunteers: 45, tasks: 23 },
        { day: 'Tue', volunteers: 52, tasks: 31 },
        { day: 'Wed', volunteers: 61, tasks: 28 },
        { day: 'Thu', volunteers: 58, tasks: 35 },
        { day: 'Fri', volunteers: 70, tasks: 42 },
        { day: 'Sat', volunteers: 89, tasks: 48 },
        { day: 'Sun', volunteers: 65, tasks: 38 }
    ];

    res.json({
        stats: [
            {
                title: 'Total Volunteers',
                value: totalVolunteers.toLocaleString(),
                change: '+0%', // Dynamic calc needs history
                icon: 'FaUsers',
                color: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600'
            },
            {
                title: 'Active Today',
                value: activeVolunteers.toLocaleString(),
                change: '+0%',
                icon: 'FaCheckCircle',
                color: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600'
            },
            {
                title: 'Tasks Completed',
                value: completedTasks.toLocaleString(),
                change: '+0%',
                icon: 'FaTrophy',
                color: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600'
            },
            {
                title: 'Hours Contributed',
                value: '0', // Placeholder
                change: '+0%',
                icon: 'FaClock',
                color: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600'
            }
        ],
        upcomingTasks: upcomingTasks.map(t => ({
            id: t.id,
            title: t.title,
            location: 'Remote', // Task model doesn't have location yet
            date: t.duetime,
            time: t.duetime ? new Date(t.duetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day',
            volunteers: 0,
            spotsLeft: 0
        })),
        recentActivities: [], // Populate if AuditLog is usable
        activityData,
        taskDistribution: [
            { name: 'General', value: 100, color: '#3b82f6' }
        ]
    });
});

const { Op } = require('sequelize');

//@route    GET /api/dashboard/stats
//@desc     Get dashboard statistics
//@access   Private
const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Candidate Info
    // const candidateProfile = await CandidateProfile.findOne({
    //     include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }] // Assuming association exists or needs to be manual if not defined
    // });

    // Fallback if no candidate profile
    // const candidateData = {
    //     name: candidateProfile?.user?.name || "Candidate Name",
    //     constituency: "Constituency",
    //     party: "Party Name",
    //     winProbability: 75, // Mock for now
    //     photo: candidateProfile?.photo_url || null
    // };

    // 2. Voter Stats
    const totalVoters = await Voter.count();
    // Assuming we want to show 'reached' based on same logic or keeping it simple
    // Let's use VoteCentre total voters as 'Target' (Registered in centers) vs 'Total Collected' (In our DB)
    // Actually VoteCentre has total_voters string, we need to sum it up.

    // Sum total_voters from VoteCentre (need to cast to number)
    // Note: total_voters is string in model, might contain commas.
    // For safety, let's just count rows for catch
    const totalVoteCentres = await VoteCentre.count();

    // 3. Volunteers
    // Find role id for 'volunteer'
    const volunteerRole = await Role.findOne({ where: { name: 'volunteer' } });
    let activeVolunteers = 0;
    let totalVolunteers = 0;

    if (volunteerRole) {
        // This count approach depends on Many-to-Many generic counting or finding users with that role
        // A simpler way if associations are standard:
        // But Role.users is M:N.
        // We can count UserRole records or simpler:
        const volunteers = await User.findAll({
            include: [{
                model: Role,
                as: 'roles',
                where: { id: volunteerRole.id }
            }],
            attributes: ['id', 'isActive']
        });
        totalVolunteers = volunteers.length;
        activeVolunteers = volunteers.filter(v => v.isActive).length;
    }

    // 4. Events
    const now = new Date();
    const upcomingEvents = await Event.count({
        where: {
            expected_start_datetime: { [Op.gt]: now }
        }
    });
    const completedEvents = await Event.count({
        where: {
            expected_start_datetime: { [Op.lt]: now }
        }
    });

    // 5. Area Performance (Grouping by Ward)
    // Group voters by ward and count
    let areaPerformance = [];

    // First try by Ward
    const votersByWard = await Voter.findAll({
        attributes: [
            'ward',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['ward'],
        limit: 5,
        order: [[Sequelize.literal('count'), 'DESC']]
    });

    // Check if we have valid ward data (filter out null/empty/unknown if needed, or just check length)
    // Often "Unknown" or null comes up if data isn't clean.
    const hasWardData = votersByWard.some(v => v.ward && v.ward !== 'Unknown' && v.ward !== 'null');

    if (hasWardData && votersByWard.length > 0) {
        areaPerformance = votersByWard.map(v => ({
            area: `Ward ${v.ward || 'Unknown'}`,
            status: "Neutral",
            score: 60 + Math.floor(Math.random() * 30),
            voters: parseInt(v.dataValues.count),
            color: "bg-blue-500"
        }));
    } else {
        // Fallback to Union
        // Need to join with Union model to get name
        const votersByUnion = await Voter.findAll({
            attributes: [
                'union_id',
                [Sequelize.fn('COUNT', Sequelize.col('Voter.id')), 'count']
            ],
            include: [{
                model: Union,
                as: 'union',
                attributes: ['name', 'bn_name']
            }],
            group: ['union_id', 'union.id'], // Group by union_id and joined table pk
            limit: 5,
            order: [[Sequelize.literal('count'), 'DESC']]
        });

        areaPerformance = votersByUnion.map(v => ({
            area: v.union?.name || `Union ${v.union_id}`, // Use name if available
            status: "Neutral",
            score: 60 + Math.floor(Math.random() * 30),
            voters: parseInt(v.dataValues.count),
            color: "bg-green-500" // Different color for Union to distinguish
        }));
    }

    // 6. Recent Activity (Mock for now, or fetch latest Events/Volunteers)
    const recentActivities = [
        { type: "event", text: `${upcomingEvents} upcoming events scheduled`, time: "Just now", icon: "FaCalendarAlt", color: "text-orange-500" },
        { type: "volunteer", text: `${activeVolunteers} active volunteers monitoring`, time: "Today", icon: "FaUsersCog", color: "text-teal-500" },
        { type: "voter", text: `${totalVoters} voters data collected`, time: "Total", icon: "FaUsers", color: "text-purple-500" }
    ];

    // 7. Social Analytics Stats
    const socialAnalytics = await SocialAnalytics.findAll({
        attributes: ['likes', 'comments_count', 'shares', 'comments']
    });

    let totalEngagement = 0;
    let totalPositiveComments = 0;
    let totalAnalyzedComments = 0;

    socialAnalytics.forEach(post => {
        totalEngagement += (post.likes || 0) + (post.comments_count || 0) + (post.shares || 0);

        // Calculate sentiment from stored comments JSON
        let comments = [];
        try {
            comments = typeof post.comments === 'string' ? JSON.parse(post.comments) : (post.comments || []);
        } catch (e) {
            comments = [];
        }

        if (Array.isArray(comments)) {
            comments.forEach(c => {
                totalAnalyzedComments++;
                if (c.sentiment && c.sentiment.toLowerCase().includes('positive')) {
                    totalPositiveComments++;
                }
            });
        }
    });

    const sentimentScore = totalAnalyzedComments > 0
        ? Math.round((totalPositiveComments / totalAnalyzedComments) * 100)
        : 0;

    res.json({
        // candidate: candidateData,
        voterStats: {
            totalVoters: totalVoters, // This is our collected "Reach"
            targetedVoters: totalVoters * 1.2, // Mock target slightly higher
            reachedVoters: totalVoters,
        },
        events: {
            upcoming: upcomingEvents,
            completed: completedEvents
        },
        volunteers: {
            total: totalVolunteers,
            active: activeVolunteers,
            tasksCompleted: 0 // Placeholder
        },
        communication: {
            smsSent: 0,
            callsMade: 0
        },
        pollingBooths: totalVoteCentres,
        areaPerformance,
        recentActivities,
        socialAnalytics: {
            engagementScore: totalEngagement,
            sentimentScore: sentimentScore
        }
    });
});

module.exports = {
    getDashboardStats,
    getVolunteerStats
};
