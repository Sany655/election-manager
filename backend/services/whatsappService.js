const axios = require('axios');

const BASE_URL = 'https://api.soon.it';
const API_KEY = 'dea55f14-806d-4974-8f28-5a55b27224a0'; // Ideally move to ENV, keeping consistent with controller for now

const getAxiosConfig = () => {
    return {
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
        }
    };
};

const sendText = async (phone, message) => {
    const sessionName = process.env.WHATSAPP_SESSION_NAME || 'default'; // Fallback or ensure ENV is set

    if (!sessionName) {
        console.error('WHATSAPP_SESSION_NAME not set');
        return null;
    }

    try {
        const config = getAxiosConfig();
        const response = await axios.post(`${BASE_URL}/api/${sessionName}/sendText`, {
            phone,
            message
        }, config);
        return response.data;
    } catch (error) {
        console.error('WhatsApp Service Error:', error.response?.data || error.message);
        // We don't throw here to prevent blocking the main flow (e.g., assignment should succeed even if WA fails)
        return null;
    }
};

module.exports = {
    sendText
};
