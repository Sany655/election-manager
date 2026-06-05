
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Fetch Location IDs
        const [divisions] = await queryInterface.sequelize.query(
            `SELECT id FROM divisions WHERE name = 'Chattagram' LIMIT 1;`
        );
        const divisionId = divisions[0]?.id;

        const [districts] = await queryInterface.sequelize.query(
            `SELECT id FROM districts WHERE name = 'Chattogram' LIMIT 1;`
        );
        const districtId = districts[0]?.id;

        const [upazillas] = await queryInterface.sequelize.query(
            `SELECT id FROM upazillas WHERE name = 'Rangunia' LIMIT 1;`
        );
        const upazillaId = upazillas[0]?.id;

        const [unions] = await queryInterface.sequelize.query(
            `SELECT id FROM unions WHERE name = 'Betagi' LIMIT 1;`
        );
        const unionId = unions[0]?.id;

        // 2. Fetch Role ID for 'volunteer'
        const [roles] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name = 'volunteer' LIMIT 1;`
        );
        const volunteerRoleId = roles[0]?.id;

        if (!divisionId || !districtId || !upazillaId || !unionId || !volunteerRoleId) {
            console.error('Missing required location or role data. Skipping seeder.');
            console.log({ divisionId, districtId, upazillaId, unionId, volunteerRoleId });
            return;
        }

        // 3. Volunteer Data (Transcribed)
        const volunteers = [
            // Image 1: Ward 06
            { sl: 1, name: "অধ্যাপক আজম খান চৌধুরী", designation: "প্রধান সমন্বয়ক", mobile: "01815930204", ward: 6 },
            { sl: 2, name: "সৈয়দ ফজলুল করিম (মিনা)", designation: "সমন্বয়ক", mobile: "0181970829", ward: 3 },
            { sl: 3, name: "জাহাঙ্গীর আলম চৌধুরী", designation: "সমন্বয়ক", mobile: "01714410011", ward: 6 },
            { sl: 4, name: "জসিম উদ্দীন চৌধুরী", designation: "সমন্বয়ক", mobile: "01790050694", ward: 6 },
            { sl: 5, name: "নিজামুল হক চৌধুরী (তপন)", designation: "সমন্বয়ক", mobile: "01819801584", ward: 3 },
            { sl: 6, name: "সোলাইমান (কালু)", designation: "সমন্বয়ক", mobile: "01828066793", ward: 4 },
            { sl: 7, name: "মাহাবুব আলম তালুকদার", designation: "সমন্বয়ক", mobile: "01817793485", ward: 8 },
            { sl: 8, name: "কাজী মোঃ নাজীম উদ্দীন", designation: "সমন্বয়ক", mobile: "01817772220", ward: 9 },
            { sl: 9, name: "ফজল কাদের তালুকদার", designation: "সমন্বয়ক", mobile: "01611177946", ward: 7 },
            { sl: 10, name: "মোঃ মিতজবুল্লাহ বাহার", designation: "সমন্বয়ক", mobile: "01881556240", ward: 1 },
            { sl: 11, name: "মোহাম্মদ শাহ নওয়াজ সেন্টু", designation: "সম্মানিত সদস্য", mobile: "01839686848", ward: 1 },
            { sl: 12, name: "মোহাম্মদ ইউচুপ চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01617718280", ward: 1 },
            { sl: 13, name: "মোহাম্মদ নোমান চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01859849698", ward: 1 },
            { sl: 14, name: "মোহাম্মদ মুন্না", designation: "সম্মানিত সদস্য", mobile: "01819944507", ward: 1 },
            { sl: 15, name: "বাবু কাঞ্চন চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01959454438", ward: 1 },
            { sl: 16, name: "জিকু দত্ত", designation: "সম্মানিত সদস্য", mobile: null, ward: 1 },
            { sl: 17, name: "আকতার হোসেন রুবেল", designation: "সম্মানিত সদস্য", mobile: null, ward: 1 },
            { sl: 18, name: "মোহাম্মদ ফারুক", designation: "সম্মানিত সদস্য", mobile: null, ward: 1 },
            { sl: 19, name: "জিল্লুর রহমান টিপু", designation: "সম্মানিত সদস্য", mobile: null, ward: 1 },

            // Image 2: Ward 02
            { sl: 20, name: "মোহাম্মদ খালেদ", designation: "সম্মানিত সদস্য", mobile: "01811900669", ward: 2 },
            { sl: 21, name: "মোহাম্মদ মনির ইসলাম", designation: "সম্মানিত সদস্য", mobile: null, ward: 2 },
            { sl: 22, name: "মোহাম্মদ আলী ওসমান মেম্বার", designation: "সম্মানিত সদস্য", mobile: "01817712086", ward: 2 },
            { sl: 23, name: "মোহাম্মদ বাবলু", designation: "সম্মানিত সদস্য", mobile: "01819640130", ward: 2 },
            { sl: 24, name: "মোহাম্মদ তাহের", designation: "সম্মানিত সদস্য", mobile: "01620597127", ward: 2 },
            { sl: 25, name: "মোহাম্মদ মুন্না সিকদার", designation: "সম্মানিত সদস্য", mobile: "01645091895", ward: 2 },
            { sl: 26, name: "মোহাম্মদ ইয়াছিন", designation: "সম্মানিত সদস্য", mobile: null, ward: 2 },
            { sl: 27, name: "গোপাল দাশ", designation: "সম্মানিত সদস্য", mobile: null, ward: 2 },
            { sl: 28, name: "মোহাম্মদ ইউচুপ", designation: "সম্মানিত সদস্য", mobile: null, ward: 2 },
            { sl: 29, name: "তাওহিদুল আনোয়ার রাফি", designation: "সম্মানিত সদস্য", mobile: null, ward: 2 },

            // Image 2: Ward 03
            { sl: 30, name: "সাইফুল হক চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01840424976", ward: 3 },
            { sl: 31, name: "মাকসুদুল হক চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01840219616", ward: 3 },
            { sl: 32, name: "সৈয়দ সাবেরুল ইসলাম", designation: "সম্মানিত সদস্য", mobile: "01815946694", ward: 3 },
            { sl: 33, name: "সৈয়দ আহাদ করিম", designation: "সম্মানিত সদস্য", mobile: "0185799737", ward: 3 },
            { sl: 34, name: "মোহাম্মদ বখতিয়ার", designation: "সম্মানিত সদস্য", mobile: "01819369688", ward: 3 },
            { sl: 35, name: "মোহাম্মদ রেজাউল করিম", designation: "সম্মানিত সদস্য", mobile: null, ward: 3 },
            { sl: 36, name: "মোহাম্মদ শহিদুল্লাহ", designation: "সম্মানিত সদস্য", mobile: "01830115605", ward: 3 },
            { sl: 37, name: "মিনহাজুল ইসলাম চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01331809123", ward: 3 },
            { sl: 38, name: "মোহাম্মদ আজাদ চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01890691490", ward: 3 },
            { sl: 39, name: "মোহাম্মদ রায়হান", designation: "সম্মানিত সদস্য", mobile: "01834662272", ward: 3 },

            // Image 3: Ward 03 (continued)
            { sl: 40, name: "মোহাম্মদ ইছহাক", designation: "সম্মানিত সদস্য", mobile: null, ward: 3 },
            { sl: 41, name: "জিয়াউর রহমান চৌধুরী (জিয়া)", designation: "সম্মানিত সদস্য", mobile: null, ward: 3 },
            { sl: 42, name: "আব্দুল আজিজ কুরায়শি", designation: "সম্মানিত সদস্য", mobile: null, ward: 3 },
            { sl: 43, name: "জসিম উদ্দীন", designation: "সম্মানিত সদস্য", mobile: "01629458990", ward: 3 },
            { sl: 44, name: "মোহাম্মদ মোরশেদ আলম", designation: "সম্মানিত সদস্য", mobile: null, ward: 3 },
            { sl: 45, name: "মোহাম্মদ রাসেল", designation: "সম্মানিত সদস্য", mobile: null, ward: 3 },

            // Image 3: Ward 04
            { sl: 46, name: "মোহাম্মদ হারুন", designation: "সম্মানিত সদস্য", mobile: "01817727338", ward: 4 },
            { sl: 47, name: "মোহাম্মদ আবছার", designation: "সম্মানিত সদস্য", mobile: null, ward: 4 },
            { sl: 48, name: "ইঞ্জিনিয়ার মোহাম্মদ মামুন", designation: "সম্মানিত সদস্য", mobile: "0164377737", ward: 4 },
            { sl: 49, name: "জগির মেম্বার", designation: "সম্মানিত সদস্য", mobile: "01819360071", ward: 4 },
            { sl: 50, name: "বাবু মিশেন চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01829925613", ward: 4 },
            { sl: 51, name: "নাজির আহমদ", designation: "সম্মানিত সদস্য", mobile: null, ward: 4 },
            { sl: 52, name: "মোহাম্মদ রুজেল", designation: "সম্মানিত সদস্য", mobile: null, ward: 4 },
            { sl: 53, name: "ইঞ্জিনিয়ার সাইদুর রহমান শাহেদ", designation: "সম্মানিত সদস্য", mobile: "01770182811", ward: 4 },
            { sl: 54, name: "মোহাম্মদ জিয়াউল হাসান মিনার", designation: "সম্মানিত সদস্য", mobile: "01684015863", ward: 4 },
            { sl: 55, name: "আলী আকবর", designation: "সম্মানিত সদস্য", mobile: null, ward: 4 },
            { sl: 56, name: "মোহাম্মদ শফি", designation: "সম্মানিত সদস্য", mobile: null, ward: 4 },

            // Image 3: Ward 05
            { sl: 57, name: "আবু তাহের", designation: "সম্মানিত সদস্য", mobile: "01600370703", ward: 5 },
            { sl: 58, name: "মোহাম্মদ আজম খান", designation: "সম্মানিত সদস্য", mobile: null, ward: 5 },
            { sl: 59, name: "ড. তত্ত বড়ুয়া", designation: "সম্মানিত সদস্য", mobile: null, ward: 5 },

            // Image 4: Ward 05 (continued)
            { sl: 60, name: "মোহাম্মদ আলমগীর", designation: "সম্মানিত সদস্য", mobile: null, ward: 5 },
            { sl: 61, name: "মোহাম্মদ ইউচুপ", designation: "সম্মানিত সদস্য", mobile: null, ward: 5 },
            { sl: 62, name: "বাবু টিপলু বড়ুয়া", designation: "সম্মানিত সদস্য", mobile: "01842374625", ward: 5 },
            { sl: 63, name: "মোহাম্মদ আরিফ উদ্দীন", designation: "সম্মানিত সদস্য", mobile: "01815981978", ward: 5 },
            { sl: 64, name: "মোহাম্মদ সাজ্জাদ হোসেন", designation: "সম্মানিত সদস্য", mobile: "01871813921", ward: 5 },

            // Image 4: Ward 06
            { sl: 65, name: "মোহাম্মদ সলিমুল্লাহ খান", designation: "সম্মানিত সদস্য", mobile: "01879266404", ward: 6 },
            { sl: 66, name: "মফিজ আহমদ চৌধুরী", designation: "সম্মানিত সদস্য", mobile: "01852605000", ward: 6 },
            { sl: 67, name: "আহমদ সৈয়দ মেম্বার", designation: "সম্মানিত সদস্য", mobile: "01818860393", ward: 6 },
            { sl: 68, name: "মোহাম্মদ সামসুল আলম", designation: "সম্মানিত সদস্য", mobile: null, ward: 6 },
            { sl: 69, name: "আব্দুল্লাহ আল নোমান", designation: "সম্মানিত সদস্য", mobile: "01825781263", ward: 6 },
            { sl: 70, name: "মোহাম্মদ আবছার", designation: "সম্মানিত সদস্য", mobile: "01829981947", ward: 6 },
            { sl: 71, name: "মোহাম্মদ ইউচুপ", designation: "সম্মানিত সদস্য", mobile: "01811988507", ward: 6 },
            { sl: 72, name: "মোহাম্মদ রফিক", designation: "সম্মানিত সদস্য", mobile: "01815143200", ward: 6 },
            { sl: 73, name: "মোহাম্মদ জামাল উদ্দীন", designation: "সম্মানিত সদস্য", mobile: "01855946231", ward: 6 },
            { sl: 74, name: "নুরুল ইমরান", designation: "সম্মানিত সদস্য", mobile: null, ward: 6 },
            { sl: 75, name: "জসিম উদ্দীন", designation: "সম্মানিত সদস্য", mobile: null, ward: 6 },
            { sl: 76, name: "মোহাম্মদ করিম", designation: "সম্মানিত সদস্য", mobile: null, ward: 6 },
            { sl: 77, name: "নাজমুল হক", designation: "সম্মানিত সদস্য", mobile: "01811170421", ward: 6 },
            { sl: 78, name: "মেহেদী হাসান নয়ন", designation: "সম্মানিত সদস্য", mobile: "01837944377", ward: 6 },
            { sl: 79, name: "মঈন উদ্দিন চৌধুরী (রাসেল)", designation: "সম্মানিত সদস্য", mobile: "01820235858", ward: 6 },

            // Image 5: Ward 09
            { sl: 100, name: "এডভোকেট অলি আহমেদ", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 101, name: "ইঞ্জিনিয়ার আজাদুর রহমান রুবেল", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 102, name: "মোহাম্মদ নাসিম সওদাগর", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 103, name: "লাল মিয়া মেম্বার", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 104, name: "কাজী মোহাম্মদ কামাল উদ্দীন সওদাগর", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 105, name: "মোহাম্মদ নাজিম তালুকদার", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 106, name: "মোহাম্মদ শাহ আলম", designation: "সম্মানিত সদস্য", mobile: "01812571550", ward: 9 },
            { sl: 107, name: "কাজী ইসহাক", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 108, name: "তাওহীদুল ইসলাম", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 109, name: "কাজী মোহাম্মদ জালাল উদ্দিন", designation: "সম্মানিত সদস্য", mobile: null, ward: 9 },
            { sl: 110, name: "মোঃ আজগর", designation: "সম্মানিত সদস্য", mobile: "01619544404", ward: 9 },
            { sl: 111, name: "মোঃ আজিম সওদাগর", designation: "সম্মানিত সদস্য", mobile: "01815151616", ward: 9 }
        ];



        // 4. Handle Designations
        const uniqueDesignations = [...new Set(volunteers.map(v => v.designation).filter(Boolean))];
        const now = new Date();

        // 4a. Ensure Designations Exist
        for (const roleName of uniqueDesignations) {
            const [existing] = await queryInterface.sequelize.query(
                `SELECT id FROM designations WHERE name = '${roleName}' LIMIT 1;`
            );

            if (existing.length === 0) {
                await queryInterface.bulkInsert('designations', [{
                    name: roleName,
                    description: roleName, // Using name as description for now
                    createdAt: now,
                    updatedAt: now
                }]);
            }
        }

        // 4b. Fetch All Designation IDs Map
        const [allDesignations] = await queryInterface.sequelize.query(
            `SELECT id, name FROM designations;`
        );
        const designationMap = {};
        allDesignations.forEach(d => {
            designationMap[d.name] = d.id;
        });

        const hashedPassword = await bcrypt.hash('123456', 10);

        for (const vol of volunteers) {
            // Create or Update User
            await queryInterface.bulkInsert('users', [{
                name: vol.name,
                // Using mobile as potential unique identifier part or email fallback
                email: vol.mobile ? `${vol.mobile}@volunteer.com` : `volunteer${vol.sl}@volunteer.com`,
                msisdn: vol.mobile, // Can be null
                password: hashedPassword,
                isActive: true,
                isActive: true,
                employee_id: `VOL-${String(vol.sl).padStart(4, '0')}`,
                designation_id: designationMap[vol.designation] || null,
                // New Location Fields
                division_id: divisionId,
                district_id: districtId,
                upazilla_id: upazillaId,
                union_id: unionId,
                ward: vol.ward,
                createdAt: now,
                updatedAt: now,
                updatedAt: now,
            }], {
                updateOnDuplicate: ['name', 'msisdn', 'ward', 'division_id', 'district_id', 'upazilla_id', 'union_id', 'designation_id', 'updatedAt']
            });

            // We need to fetch the inserted/updated user ID to assign role
            // Since bulkInsert doesn't always return ID in all dialects/versions easily for upsert,
            // we'll query by unique field (email or employee_id)
            const [users] = await queryInterface.sequelize.query(
                `SELECT id FROM users WHERE employee_id = 'VOL-${String(vol.sl).padStart(4, '0')}';`
            );

            if (users && users.length > 0) {
                const userId = users[0].id;

                // Assign Role
                // Check if role exists
                const [existingRole] = await queryInterface.sequelize.query(
                    `SELECT * FROM user_roles WHERE user_id = ${userId} AND role_id = ${volunteerRoleId};`
                );

                if (existingRole.length === 0) {
                    await queryInterface.bulkInsert('user_roles', [{
                        user_id: userId,
                        role_id: volunteerRoleId,
                        createdAt: now,
                        updatedAt: now
                    }]);
                }
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Optional: Delete volunteers created by this seeder
        // await queryInterface.bulkDelete('users', { employee_id: { [Sequelize.Op.like]: 'VOL-%' } });
    }
};
