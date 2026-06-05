const { default: axios } = require("axios");
const asyncHandler = require("../../middleware/asyncHandler");
const db = require('../../models/index');
const ErrorResponse = require("../../utils/errorresponse");
const sendMail = require("../../utils/sendMail");
const { Area, Location, VolunteerTeamMember, User } = db;

const WHATSAPP_BASE_URL = 'https://api.soon.it';
const WHATSAPP_API_KEY = 'dea55f14-806d-4974-8f28-5a55b27224a0';

// Helper to get axios config with auth for WhatsApp
const getWhatsAppAxiosConfig = () => {
    return {
        headers: {
            'x-api-key': WHATSAPP_API_KEY,
            'Content-Type': 'application/json'
        }
    };
};


//@route    /api/areas
//@desc     POST: create a new area
//@access   protected by admin
const sendEmail = asyncHandler(async (req, res, next) => {
    const { email, subject, message } = req.body; // to mail
    const mailres = await sendMail({ email, subject, message });
    return res.status(200).json({
        success: true,
        msg: "Email sent successfully!",
        data: mailres
    });
})

//@route    /api/areas
//@desc     POST: create a new area
//@access   protected by admin
const sendSms = asyncHandler(async (req, res, next) => {
    const { numbers, message } = req.body;

    if (!numbers || !message) {
        return res.status(400).json({
            success: false,
            msg: "Numbers and message are required"
        });
    }

    const batchSize = 10; // Process 10 numbers at a time
    const results = [];
    const failed = [];

    // Split numbers into batches
    for (let i = 0; i < numbers.length; i += batchSize) {
        const batch = numbers.slice(i, i + batchSize);

        const batchPromises = batch.map(number =>
            axios.get(process.env.SMS_BASE_API, {
                params: {
                    user: process.env.SMS_USER,
                    key: process.env.SMS_API_KEY,
                    to: number,
                    msg: message
                }
            })
                .then(response => ({ number, status: 'success', response: response.data }))
                .catch(error => ({ number, status: 'failed', error: error.message }))
        );

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            if (result.status === 'success') {
                results.push(result);
            } else {
                failed.push(result);
            }
        });

        // Delay between batches to avoid rate limiting
        if (i + batchSize < numbers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
    }

    return res.status(200).json({
        success: true,
        msg: "Bulk SMS process completed",
        total: numbers.length,
        successful: results.length,
        failed: failed.length,
        results,
        failedNumbers: failed
    });
});


const sendMessageToTeams = asyncHandler(async (req, res, next) => {
    const { team_ids, message, subject, type } = req.body;

    if (!team_ids || !Array.isArray(team_ids) || team_ids.length === 0) {
        return res.status(400).json({
            success: false,
            msg: "No team found, assign team first!"
        });
    }

    if (!message) {
        return res.status(400).json({
            success: false,
            msg: "Message content is required"
        });
    }

    // 1. Fetch all members of the teams
    const members = await VolunteerTeamMember.findAll({
        where: {
            volunteer_team_id: team_ids
        },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'msisdn', 'name']
        }]
    });

    if (!members || members.length === 0) {
        return res.status(404).json({
            success: false,
            msg: "No members found in the selected teams"
        });
    }

    // 2. Extract unique users and filter by valid contact info
    const uniqueUsers = {};
    members.forEach(member => {
        if (member.user) {
            uniqueUsers[member.user.id] = member.user;
        }
    });

    const users = Object.values(uniqueUsers);
    let successCount = 0;
    let failCount = 0;
    let results = [];

    if (type === 'email') {
        const validEmails = users.filter(u => u.email).map(u => u.email);

        if (validEmails.length === 0) {
            return res.status(400).json({ success: false, msg: "No valid email addresses found." });
        }

        // Send individual emails or use bcc? 
        // For now loop through and send (simpler for tracking individual status if needed, but slower)
        // Or re-use sendEmail logic if it supported bulk. The current sendEmail takes one email.

        // Let's use Promise.all for parallel sending
        const emailPromises = validEmails.map(async (email) => {
            try {
                await sendMail({ email, subject: subject || "Team Message", message });
                return { email, status: 'success' };
            } catch (err) {
                console.error(`Failed to send email to ${email}`, err);
                return { email, status: 'failed', error: err.message };
            }
        });

        results = await Promise.all(emailPromises);
        successCount = results.filter(r => r.status === 'success').length;
        failCount = results.filter(r => r.status === 'failed').length;

    } else if (type === 'sms') {
        const validNumbers = users.filter(u => u.msisdn).map(u => u.msisdn);

        if (validNumbers.length === 0) {
            return res.status(400).json({ success: false, msg: "No valid phone numbers found." });
        }

        // Reuse sendSms logic structure
        const smsResponse = await axios.get(process.env.SMS_BASE_API, {
            params: {
                user: process.env.SMS_USER,
                key: process.env.SMS_API_KEY,
                to: validNumbers.join(','), // Many SMS APIs support comma separated
                msg: message
            }
        }).catch(err => {
            console.error("SMS API Error", err);
            return { data: "Failed" }; // Mock fail response
        });

        // Note: The previous sendSms implementation did batching. 
        // If we want to be safe, we should probably just call the internal logic of sendSms or copy it.
        // Since I can't easily import `sendSms` inside the same file to use its internal logic without refactoring, 
        // I'll stick to a simple implementation assumption that the API handles bulk or I'll iterate.

        // Let's iterate strictly to be safe as per the existing sendSms pattern which batches logic

        const batchSize = 10;
        const batchResults = [];

        for (let i = 0; i < validNumbers.length; i += batchSize) {
            const batch = validNumbers.slice(i, i + batchSize);
            // Assuming the external API can take comma separated for bulk, otherwise loop.
            // The existing sendSms loop does ONE BY ONE requests in parallel batches.

            const batchPromises = batch.map(number =>
                axios.get(process.env.SMS_BASE_API, {
                    params: {
                        user: process.env.SMS_USER,
                        key: process.env.SMS_API_KEY,
                        to: number,
                        msg: message
                    }
                })
                    .then(response => ({ number, status: 'success' }))
                    .catch(error => ({ number, status: 'failed', error: error.message }))
            );

            const bRes = await Promise.all(batchPromises);
            batchResults.push(...bRes);

            if (i + batchSize < validNumbers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        results = batchResults;
        successCount = results.filter(r => r.status === 'success').length;
        failCount = results.filter(r => r.status === 'failed').length;
    } else if (type === 'whatsapp') {
        const validNumbers = users.filter(u => u.msisdn).map(u => u.msisdn);

        if (validNumbers.length === 0) {
            return res.status(400).json({ success: false, msg: "No valid phone numbers found for WhatsApp." });
        }

        const sessionName = process.env.WHATSAPP_SESSION_NAME;
        if (!sessionName) {
            return res.status(500).json({ success: false, msg: "WHATSAPP_SESSION_NAME env variable is not set" });
        }

        // Use batching similar to SMS/Bulk WhatsApp
        const batchSize = 5;
        const batchResults = [];
        const config = getWhatsAppAxiosConfig();

        for (let i = 0; i < validNumbers.length; i += batchSize) {
            const batch = validNumbers.slice(i, i + batchSize);

            const batchPromises = batch.map(phone => {
                if (phone.startsWith('0')) {
                    phone = '88' + phone
                } else if (phone.startsWith('*')) {
                    phone = '88' + phone.slice(1, phone.length)
                }
                return axios.post(`${WHATSAPP_BASE_URL}/api/${sessionName}/sendText`, {
                    phone,
                    message
                }, config)
                    .then(response => ({ phone, status: 'success', data: response.data }))
                    .catch(error => ({ phone, status: 'failed', error: error.message }))
            });

            const bRes = await Promise.all(batchPromises);
            batchResults.push(...bRes);

            // Delay between batches
            if (i + batchSize < validNumbers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        results = batchResults;
        successCount = results.filter(r => r.status === 'success').length;
        failCount = results.filter(r => r.status === 'failed').length;

    } else {
        return res.status(400).json({ success: false, msg: "Invalid message type" });
    }

    return res.status(200).json({
        success: true,
        msg: `Processed ${users.length} users. Success: ${successCount}, Failed: ${failCount}`,
        results
    });
});


module.exports = {
    sendEmail,
    sendSms,
    sendMessageToTeams
}