'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [existing] = await queryInterface.sequelize.query("SELECT * FROM unions WHERE name = 'CHAR MATUA' LIMIT 1");
        if (existing.length > 0) {
            return;
        }

        const noakhaliSadarId = 43;
        const subarnacharId = 47;

        const unions = [
            // Noakhali Sadar (43)
            { name: 'ANDERCHAR', bn_name: 'আণ্ডারচর', upazilla_id: noakhaliSadarId, pcode: '10' }, // Dummy pcode
            { name: 'CHAR MATUA', bn_name: 'চর মটুয়া', upazilla_id: noakhaliSadarId, pcode: '12' },
            { name: 'EWAZBALIA', bn_name: 'এওয়াজবালিয়া', upazilla_id: noakhaliSadarId, pcode: '14' },
            { name: 'KADIR HANIF', bn_name: 'কাদির হানিফ', upazilla_id: noakhaliSadarId, pcode: '16' },
            { name: 'KALADARAF', bn_name: 'কালাদারাফ', upazilla_id: noakhaliSadarId, pcode: '18' },
            { name: 'NOANNAI', bn_name: 'নোয়ান্নই', upazilla_id: noakhaliSadarId, pcode: '20' },
            { name: 'PURBA CHAR MATUA', bn_name: 'পূর্ব চর মটুয়া', upazilla_id: noakhaliSadarId, pcode: '22' },
            { name: 'WARD NO-01', bn_name: 'ওয়ার্ড নং-০১', upazilla_id: noakhaliSadarId, pcode: '91' },
            { name: 'WARD NO-02', bn_name: 'ওয়ার্ড নং-০২', upazilla_id: noakhaliSadarId, pcode: '92' },
            { name: 'WARD NO-03', bn_name: 'ওয়ার্ড নং-০৩', upazilla_id: noakhaliSadarId, pcode: '93' },
            { name: 'WARD NO-04', bn_name: 'ওয়ার্ড নং-০৪', upazilla_id: noakhaliSadarId, pcode: '94' },
            { name: 'WARD NO-05', bn_name: 'ওয়ার্ড নং-০৫', upazilla_id: noakhaliSadarId, pcode: '95' },
            { name: 'WARD NO-06', bn_name: 'ওয়ার্ড নং-০৬', upazilla_id: noakhaliSadarId, pcode: '96' },
            { name: 'WARD NO-07', bn_name: 'ওয়ার্ড নং-০৭', upazilla_id: noakhaliSadarId, pcode: '97' },
            { name: 'WARD NO-08', bn_name: 'ওয়ার্ড নং-০৮', upazilla_id: noakhaliSadarId, pcode: '98' },
            { name: 'WARD NO-09', bn_name: 'ওয়ার্ড নং-০৯', upazilla_id: noakhaliSadarId, pcode: '99' },

            // Subarnachar (47)
            { name: 'CHAR AMANULLAH', bn_name: 'চর আমানউল্যাহ', upazilla_id: subarnacharId, pcode: '30' },
            { name: 'CHAR BATA', bn_name: 'চর বাটা', upazilla_id: subarnacharId, pcode: '31' },
            { name: 'CHAR CLERK', bn_name: 'চর ক্লার্ক', upazilla_id: subarnacharId, pcode: '32' },
            { name: 'CHAR JABBAR', bn_name: 'চর জব্বার', upazilla_id: subarnacharId, pcode: '33' },
            { name: 'CHAR JUBILLE', bn_name: 'চর জুবিলী', upazilla_id: subarnacharId, pcode: '34' },
            { name: 'CHAR WAPDA', bn_name: 'চর ওয়াপদা', upazilla_id: subarnacharId, pcode: '35' },
            { name: 'PURBA CHAR BATA', bn_name: 'পূর্ব চর বাটা', upazilla_id: subarnacharId, pcode: '36' },
        ];

        await queryInterface.bulkInsert('unions', unions);
    },

    async down(queryInterface, Sequelize) {
        // Dangerous to delete by name in bulk, but for this seeder set it's okay locally
        await queryInterface.bulkDelete('unions', {
            name: [
                'ANDERCHAR', 'CHAR MATUA', 'EWAZBALIA', 'KADIR HANIF', 'KALADARAF', 'NOANNAI', 'PURBA CHAR MATUA',
                'WARD NO-01', 'WARD NO-02', 'WARD NO-03', 'WARD NO-04', 'WARD NO-05', 'WARD NO-06', 'WARD NO-07', 'WARD NO-08', 'WARD NO-09',
                'CHAR AMANULLAH', 'CHAR BATA', 'CHAR CLERK', 'CHAR JABBAR', 'CHAR JUBILLE', 'CHAR WAPDA', 'PURBA CHAR BATA'
            ]
        }, {});
    }
};
