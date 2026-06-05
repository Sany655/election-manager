const { default: axios } = require("axios");
const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../utils/errorresponse");

const BASE_URL = 'https://api.soon.it';
const API_KEY = 'dea55f14-806d-4974-8f28-5a55b27224a0';

// Helper to get axios config with auth
const getAxiosConfig = () => {
    return {
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
        }
    };
};

// @route   POST /api/whatsapp/logout
// @desc    Logout session
// @access  Protected
const logout = asyncHandler(async (req, res, next) => {
    const sessionName = process.env.WHATSAPP_SESSION_NAME;

    if (!sessionName) {
        return next(new ErrorResponse('WHATSAPP_SESSION_NAME env variable is not set', 500));
    }

    try {
        const config = getAxiosConfig();
        await axios.post(`${BASE_URL}/api/sessions/${sessionName}/logout`, {}, {
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        }); ///api/sessions/{session}/logout
        res.status(200).json({
            success: true,
            data: 'Session stopped successfully'
        });
    } catch (error) {
        next(handleApiError(error));
    }
});

// Helper to handle API errors
const handleApiError = (error) => {
    if (error.response) {
        console.error('API Error Response:', error.response.data);
        return new ErrorResponse(error.response.data.error || 'External API Error', error.response.status);
    } else if (error.request) {
        console.error('API No Response:', error.request);
        return new ErrorResponse('No response from external API', 503);
    } else {
        console.error('API Request Error:', error.message);
        return new ErrorResponse(error.message, 500);
    }
};

// @route   GET /api/whatsapp/session
// @desc    Get session status and auto-start/QR
// @access  Protected
const getSessionStatus = asyncHandler(async (req, res, next) => {
    const sessionName = process.env.WHATSAPP_SESSION_NAME;

    if (!sessionName) {
        return next(new ErrorResponse('WHATSAPP_SESSION_NAME env variable is not set', 500));
    }

    try {
        const config = getAxiosConfig();

        // 1. Check Session Status
        let statusResponse;
        try {
            statusResponse = await axios.get(`${BASE_URL}/api/sessions/${sessionName}`, config);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Session doesn't exist, try to create it
                await axios.post(`${BASE_URL}/api/sessions`, { session: sessionName }, config);
                statusResponse = await axios.get(`${BASE_URL}/api/sessions/${sessionName}`, config);
            } else {
                throw error;
            }
        }

        let status = statusResponse.data.status; // Assuming response structure { status: '...' }

        // 2. If stopped, start it
        if (status === 'stopped' || status === 'STOPPED') {
            try {
                await axios.post(`${BASE_URL}/api/sessions/${sessionName}/start`, {}, config);
                // Re-fetch status after start command
                statusResponse = await axios.get(`${BASE_URL}/api/sessions/${sessionName}`, config);
                status = statusResponse.data.status;
            } catch (err) {
                // If start fails, maybe it's already starting or something
                console.error("Error starting session:", err.message);
                if (err.response) console.error(err.response.data);
            }
        }

        // 2. If disconnected, restart it
        if (status === 'disconnected' || status === 'DISCONNECTED') {
            try {
                await axios.post(`${BASE_URL}/api/sessions/${sessionName}/restart`, {}, config);
                // Re-fetch status after start command
                statusResponse = await axios.get(`${BASE_URL}/api/sessions/${sessionName}`, config);
                status = statusResponse.data.status;
            } catch (err) {
                // If start fails, maybe it's already starting or something
                console.error("Error starting session:", err.message);
                if (err.response) console.error(err.response.data);
            }
        }

        // 3. If QR Ready, get QR Code
        // User mentioned 'qr_ready'. We check for that or 'SCAN_QR_CODE'.
        let qrCode = null;
        if (typeof status === 'string' && (status.toLowerCase() === 'qr_ready' || status.toLowerCase() === 'scan_qr_code')) {
            try {
                const qrResponse = await axios.get(`${BASE_URL}/api/${sessionName}/auth/qr`, {
                    ...config,
                    responseType: 'arraybuffer'
                });
                // Convert buffer to base64 data URI
                const base64 = Buffer.from(qrResponse.data, 'binary').toString('base64');
                const mimeType = qrResponse.headers['content-type'] || 'image/png';
                qrCode = `data:${mimeType};base64,${base64}`;
            } catch (qrErr) {
                console.error("Error fetching QR:", qrErr.message);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                ...statusResponse.data,
                qrCode
            }
        });

    } catch (error) {
        next(handleApiError(error));
    }
});

// @route   POST /api/whatsapp/send
// @desc    Send a text message
// @access  Protected
const sendMessage = asyncHandler(async (req, res, next) => {
    const sessionName = process.env.WHATSAPP_SESSION_NAME;
    const { phone, message } = req.body;

    if (!sessionName) {
        return next(new ErrorResponse('WHATSAPP_SESSION_NAME env variable is not set', 500));
    }
    if (!phone || !message) {
        return next(new ErrorResponse('Phone and message are required', 400));
    }

    try {
        const config = getAxiosConfig();
        const response = await axios.post(`${BASE_URL}/api/${sessionName}/sendText`, {
            phone,
            message
        }, config);
        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        next(handleApiError(error));
    }
});

// @route   POST /api/whatsapp/send-bulk
// @desc    Send bulk messages (simple loop implementation)
// @access  Protected
const sendBulkMessage = asyncHandler(async (req, res, next) => {
    const sessionName = process.env.WHATSAPP_SESSION_NAME;
    const { phones, message } = req.body;

    if (!sessionName) {
        return next(new ErrorResponse('WHATSAPP_SESSION_NAME env variable is not set', 500));
    }
    if (!phones || !Array.isArray(phones) || !message) {
        return next(new ErrorResponse('Phones array and message are required', 400));
    }

    const results = [];
    const BATCH_SIZE = 5;
    const DELAY_MS = 1000;
    let config;
    try {
        config = getAxiosConfig();
    } catch (err) {
        return next(new ErrorResponse(err.message, 400));
    }

    for (let i = 0; i < phones.length; i += BATCH_SIZE) {
        const batch = phones.slice(i, i + BATCH_SIZE);

        const batchPromises = batch.map(phone =>
            axios.post(`${BASE_URL}/api/${sessionName}/sendText`, { phone, message }, config)
                .then(response => ({ phone, status: 'success', data: response.data }))
                .catch(error => ({ phone, status: 'failed', error: error.message }))
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        if (i + BATCH_SIZE < phones.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    res.status(200).json({
        success: true,
        msg: `Processed ${phones.length} numbers. Success: ${successCount}, Failed: ${failCount}`,
        results
    });
});

module.exports = {
    getSessionStatus,
    sendMessage,
    sendBulkMessage,
    logout
};
