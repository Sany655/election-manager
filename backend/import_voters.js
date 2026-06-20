require('dotenv').config();
const ExcelJS = require('exceljs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./models');

async function importNoDues() {
    console.log("Importing No Dues list...");
    const filePath = path.join(__dirname, '../voter list data/Chittagong- Voter List No Dues.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const voters = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        
        const vals = row.values;
        // Headers: [empty, MembershipNo, Name, Mobile, OtherContactInfo, Email, Division, University, Centre, PassingYear, Job, MailingAddress]
        const membershipNo = vals[1]?.toString() || '';
        const name = vals[2]?.toString() || 'Unknown Name';
        const mobile = vals[3]?.toString() || null;
        const phone = vals[4]?.toString() || null;
        const email = vals[5]?.toString() || null;
        const organization = vals[6]?.toString() || null; // Division e.g. Electrical
        const category = vals[7]?.toString() || null; // University
        const center = vals[8]?.toString() || 'CHITTAGONG';
        const passingYear = vals[9] ? parseInt(vals[9], 10) : null;
        const designation = vals[10]?.toString() || null; // Job
        const address = vals[11]?.toString() || null;
        
        voters.push({
            name: name,
            membership_no: membershipNo,
            mobile: mobile,
            phone: phone,
            email: email,
            organization: organization,
            category: category,
            voter_center: center,
            designation: designation,
            passing_year: isNaN(passingYear) ? null : passingYear,
            address: address,
            nid: membershipNo ? membershipNo : uuidv4(),
            // Location and required fields are now nullable
            age: null,
            gender: null,
            division_id: null,
            district_id: null,
            upazilla_id: null,
            union_id: null,
            ward: null
        });
    });
    
    return voters;
}

async function importDefaulters() {
    console.log("Importing Defaulters list...");
    const filePath = path.join(__dirname, '../voter list data/Chittagong- Defaulter List All.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const voters = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        
        const vals = row.values;
        // Headers: [empty, Membership No, Name, Centre, Division, Email, Univ, Passing Year, Address, Mobile, Paid Upto, # of Years Dues, Dues Amount]
        const membershipNo = vals[1]?.toString() || '';
        const name = vals[2]?.toString() || 'Unknown Name';
        const center = vals[3]?.toString() || 'CHITTAGONG';
        const organization = vals[4]?.toString() || null; // Division
        const email = vals[5]?.toString() || null;
        const category = vals[6]?.toString() || null; // Univ
        const passingYear = vals[7] ? parseInt(vals[7], 10) : null;
        const address = vals[8]?.toString() || null;
        const mobile = vals[9]?.toString() || null;
        const paidUpto = vals[10]?.toString() || null;
        const yearsOfDues = vals[11] ? parseInt(vals[11], 10) : null;
        const duesAmount = vals[12] ? parseFloat(vals[12]) : null;
        
        voters.push({
            name: name,
            membership_no: membershipNo,
            mobile: mobile,
            email: email,
            organization: organization,
            category: category,
            voter_center: center,
            passing_year: isNaN(passingYear) ? null : passingYear,
            address: address,
            paid_upto: paidUpto,
            years_of_dues: isNaN(yearsOfDues) ? null : yearsOfDues,
            dues_amount: isNaN(duesAmount) ? null : duesAmount,
            nid: membershipNo ? membershipNo : uuidv4(),
            // Location and required fields are now nullable
            age: null,
            gender: null,
            division_id: null,
            district_id: null,
            upazilla_id: null,
            union_id: null,
            ward: null
        });
    });
    
    return voters;
}

async function run() {
    try {
        await db.sequelize.authenticate();
        console.log("DB Authenticated.");
        
        // Ensure model changes are synced before inserting
        console.log("Syncing database schema...");
        await db.Voter.sync({ alter: true });
        
        console.log("Truncating existing voters data...");
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        await db.sequelize.query('TRUNCATE TABLE voters;');
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        
        let allVoters = [];
        
        const noDues = await importNoDues();
        allVoters = allVoters.concat(noDues);
        
        const defaulters = await importDefaulters();
        // Avoid duplicate NIDs
        const seenNids = new Set();
        const uniqueVoters = [];
        for (const v of allVoters.concat(defaulters)) {
            if (!seenNids.has(v.nid)) {
                seenNids.add(v.nid);
                uniqueVoters.push(v);
            }
        }
        
        console.log(`Prepared ${uniqueVoters.length} unique voters for insertion.`);
        
        // Chunk insertion
        const chunkSize = 500;
        for (let i = 0; i < uniqueVoters.length; i += chunkSize) {
            const chunk = uniqueVoters.slice(i, i + chunkSize);
            await db.Voter.bulkCreate(chunk, { ignoreDuplicates: true });
            console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
        }
        
        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit();
    }
}

run();
