const Zkteco = require("zkteco-js");

const manageZktecoDevice = async () => {
    const device = new Zkteco(
        process.env.ZKTECO_IP || "192.168.1.106",
        parseInt(process.env.ZKTECO_PORT) || 4370,
        parseInt(process.env.ZKTECO_TIMEOUT) || 5200,
        parseInt(process.env.ZKTECO_IN_PORT) || 5000
    );
    console.log('trying to connect')
    try {
        // Create socket connection to the device
        await device.createSocket();

        // Retrieve and log all attendance records
        const attendanceLogs = await device.getAttendances();
        console.log(attendanceLogs);

        // Listen for real-time logs
        await device.getRealTimeLogs((realTimeLog) => {
            console.log(realTimeLog);
        });

        // Manually disconnect after using real-time logs
        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

module.exports = { manageZktecoDevice };