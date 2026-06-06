const db = require('./models');
const { User, Role } = db;

async function test() {
    try {
        const candidateRole = await Role.findOne({ where: { name: 'candidate' } });
        console.log("Candidate role:", candidateRole ? candidateRole.id : "Not found");

        const { count, rows } = await User.findAndCountAll({
            include: [{
                model: Role,
                as: 'roles',
                where: { id: candidateRole.id },
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }],
            limit: 10,
            offset: 0,
            order: [['createdAt', 'DESC']]
        });
        console.log("Count:", count);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
