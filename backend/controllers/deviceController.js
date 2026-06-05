const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorresponse");
const db = require("../models/index");
const { AttendenceDevice, User, RffPoint } = db;
const { Op } = require("sequelize");
require("dotenv").config();
const deviceStatusInterval = process.env.DEVICE_STATUS_INTERVAL || 2; // Default to 2 minutes if not set
//@route    /api/devices/ping
//@desc     POST:fetch metdata
//@access   private
const getPingFromDevice = asyncHandler(async (req, res, next) => {
  const { mac_address, device_name, last_ping } = req.body;
  const user_id = req.user.id; // Get user_id from authenticated user

  if (!mac_address) {
    return res.status(400).json({
      success: false,
      msg: "mac_address is required",
    });
  }

  let pingDate;

  if (last_ping) {
    if (last_ping.includes("T") || last_ping.includes("+")) {
      // Already timezone-aware
      pingDate = new Date(last_ping);
    } else {
      // Assume Bangladesh time, convert to UTC
      const localTime = new Date(last_ping);
      pingDate = new Date(localTime.getTime() - 6 * 60 * 60 * 1000);
    }
  } else {
    // Use current time if last_ping not provided
    pingDate = new Date(); // Current UTC time
  }

  const values = {
    device_name: device_name || "Unknown Device",
    user_id,
    mac_address,
    last_ping: pingDate,
  };

  const [instance, created] = await AttendenceDevice.findOrCreate({
    where: { mac_address },
    defaults: values,
  });

  if (!created) {
    // Update the existing record with the new ping time
    const updateData = {
      user_id, // Update user_id in case device is reassigned
      last_ping: pingDate,
    };

    // Only update device_name if provided
    if (device_name) {
      updateData.device_name = device_name;
    }

    await instance.update(updateData);
  }

  return res.status(200).json({
    success: true,
    msg: created ? "Device inserted" : "Device updated",
    data: instance,
  });
});

//@route    /api/devices/
//@desc     GET:fetch metdata
//@access   private
const getDevices = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await AttendenceDevice.findAndCountAll({
      order: [["last_ping", "DESC"]],
      attributes: ["id", "mac_address", "last_ping", "device_name", "user_id"],
      where: {
        last_ping: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["employee_id", "name"],
          include: [
            {
              model: RffPoint,
              as: "rffPoint",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      //   limit: parseInt(limit),
      //   offset: parseInt(offset),
    });

    // Add color based on last_ping time
    const currentTime = new Date();

    const devicesWithColor = rows.map((device) => {
      const lastPing = new Date(device.last_ping);
      const timeDiffInMs = currentTime.getTime() - lastPing.getTime();
      const timeDiffInMinutes = timeDiffInMs / (1000 * 60);

      return {
        ...device.toJSON(),
        color: timeDiffInMinutes >= deviceStatusInterval ? "red" : "green",
        lastSeenMin: Math.round(timeDiffInMinutes), // Optional: include for debugging
      };
    });

    return res.status(200).json({
      success: true,
      msg: "All Devices",
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: devicesWithColor,
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch devices",
      error: error.message,
    });
  }
});

//@route    /api/devices/:id/delete
//@desc     DELETE: delete a device Permanently
//@access   protected by admin
const deleteDevicePermanently = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const device = await AttendenceDevice.findByPk(id);

  if (!device) {
    return next(new ErrorResponse("No device Found to Delete!", 404));
  }

  await device.destroy();

  return res.status(200).json({
    success: true,
    msg: `Device deleted successfully!`,
  });
});

module.exports = {
  getPingFromDevice,
  getDevices,
  deleteDevicePermanently,
};
