const asyncHandler = require("../middleware/asyncHandler");
const db = require("../models/index");
const {
  User,
  Role,
  Attendence,
  AttendencePolicy,
  AttendancePolicyHistory,
  Location,
  Area,
  RffPoint,
  Designation,
} = db;
const ErrorResponse = require("../utils/errorresponse");
const { Op, or } = require("sequelize");
const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

const { ExcelExportService, PDFExportService } = require("../services/index");
const DateUtils = require("../utils/DateUtils");
const {
  getUserHolidaysForDateRange,
  getHolidayDatesForUser,
} = require("../utils/holidayUtils");
//@route    /api/attendance/clock-in
//@desc     post
//@access   public
const clockIn = asyncHandler(async (req, res, next) => {
  const { employee_id, isManual, clock_in, location, notes } = req.body;

  // Step 1: Validate user
  const existUser = await User.findOne({
    where: { employee_id, isActive: 1 },
    include: [
      {
        model: Location,
        as: "location",
        attributes: ["location_name"],
        required: false,
      },
      {
        model: Area,
        as: "area",
        attributes: ["area_name"],
        required: false,
      },
    ],
  });

  if (!existUser) {
    return next(new ErrorResponse("User not registered or inactive!", 400));
  }

  if (!existUser.fingerprint_template) {
    return next(
      new ErrorResponse("Please register your fingerprint first.", 400)
    );
  }

  // Step 2: Get today's log if exists
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  let todayLog = await Attendence.findOne({
    where: {
      user_id: existUser.id,
      clock_in: { [Op.between]: [startOfDay, endOfDay] },
    },
  });

  const existingPolicy = await AttendancePolicyHistory.findOne({
    where: {
      user_id: { [Op.in]: [existUser.id] },
    },
    attributes: ["user_id", "attendence_policy_id"],
    order: [["createdAt", "DESC"]],
  });

  const currentTime = new Date();
  const clockInTime = isManual ? clock_in : currentTime;

  if (!todayLog) {
    // First punch — clock in
    todayLog = await Attendence.create({
      user_id: existUser.id,
      clock_in: clockInTime,
      company_attendence_policy_id: existingPolicy?.attendence_policy_id || 1,
      isManual: isManual ?? 0,
      attendance_taken_by: req.user.id,
      location: {
        clock_in: location || "",
        clock_out: ""
      },
      remarks: {
        clock_in: notes || "",
        clock_out: ""
      }
    });

    return res.status(201).json({
      success: true,
      msg: "Clock-in recorded!",
      data: {
        clock_in: todayLog.clock_in,
        user_id: todayLog.user_id,
        attendance_type: todayLog.isManual ? "Manual" : "Fingerprint",
        user_name: existUser.name,
        employee_id: existUser.employee_id,
        avatar: existUser.avatar,
        region: existUser.location ? existUser.location.location_name : "",
        area: existUser.area ? existUser.area.area_name : "",
      },
    });
  }

  // Update existing clock-in (overwrite previous clock_in)
  todayLog.clock_in = clockInTime;
  todayLog.location = {
    ...todayLog.location,
    clock_in: location || ""
  };
  todayLog.remarks = {
    ...todayLog.remarks,
    clock_in: notes || ""
  };
  await todayLog.save();

  return res.status(200).json({
    success: true,
    msg: "Clock-in recorded again!",
    data: {
      clock_in: todayLog.clock_in,
      attendance_type: todayLog.isManual ? "Manual" : "Fingerprint",
      user_name: existUser.name,
      employee_id: existUser.employee_id,
      avatar: existUser.avatar,
      region: existUser.location ? existUser.location.location_name : "",
      area: existUser.area ? existUser.area.area_name : "",
    },
  });
});

//@route    /api/attendance/clock-out
//@desc     post
//@access   protected
const clockOut = asyncHandler(async (req, res, next) => {
  const { employee_id, isManual, clock_out, location, notes } = req.body;

  // Step 1: Validate user
  const existUser = await User.findOne({
    where: { employee_id, isActive: 1 },
    include: [
      {
        model: Location,
        as: "location",
        attributes: ["location_name"],
        required: false,
      },
      {
        model: Area,
        as: "area",
        attributes: ["area_name"],
        required: false,
      },
    ],
  });

  if (!existUser) {
    return next(new ErrorResponse("User not registered or inactive!", 400));
  }

  if (!existUser.fingerprint_template) {
    return next(
      new ErrorResponse("Please register your fingerprint first.", 400)
    );
  }

  if (existUser.employee_id != employee_id) {
    return next(new ErrorResponse("Fingerprint not matched!", 400));
  }

  // Step 2: Get today's log if exists
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  let todayLog = await Attendence.findOne({
    where: {
      user_id: existUser.id,
      clock_in: { [Op.between]: [startOfDay, endOfDay] },
    },
  });

  const currentTime = new Date();
  const clockOutTime = isManual ? clock_out : currentTime;

  if (!todayLog) {
    return res.status(400).json({
      success: false,
      msg: "Clock-in not recorded yet!",
    });
  }

  // Clock-out (overwrite previous clock_out)
  todayLog.clock_out = clockOutTime;
  todayLog.location = {
    ...todayLog.location,
    clock_out: location || ""
  };
  todayLog.remarks = {
    ...todayLog.remarks,
    clock_out: notes || ""
  };
  await todayLog.save();

  return res.status(200).json({
    success: true,
    msg: "Clock-out recorded!",
    data: {
      clock_in: todayLog.clock_in,
      clock_out: todayLog.clock_out,
      attendance_type: todayLog.isManual ? "Manual" : "Fingerprint",
      user_name: existUser.name,
      employee_id: existUser.employee_id,
      avatar: existUser.avatar,
      region: existUser.location ? existUser.location.location_name : "",
      area: existUser.area ? existUser.area.area_name : "",
    },
  });
});

//@route    /api/attendance/manual
//@desc     post
//@access   public
// const manual = asyncHandler(async (req, res, next) => {
//   const { employee_id } = req.body;

//   // Step 1: Validate user
//   const existUser = await User.findOne({ where: { employee_id } });
//   if (!existUser) {
//     return next(new ErrorResponse('User not registered!', 400));
//   }

//   const existingPolicy = await AttendancePolicyHistory.findOne({
//     where: {
//       user_id: { [Op.in]: [existUser.id] }
//     },
//     attributes: ['user_id', 'attendence_policy_id'],
//     order: [['createdAt', 'DESC']]
//   });

//   const startOfDay = new Date();
//   startOfDay.setHours(0, 0, 0, 0);

//   const endOfDay = new Date();
//   endOfDay.setHours(23, 59, 59, 999);

//   let todayLog = await Attendence.findOne({
//     where: {
//       user_id: existUser.id,
//       clock_in: { [Op.between]: [startOfDay, endOfDay] }
//     }
//   });

//   const currentTime = new Date();

//   if (!todayLog) {
//     // First punch — clock in
//     todayLog = await Attendence.create({
//       user_id: existUser.id,
//       clock_in: currentTime,
//       company_attendence_policy_id: existingPolicy?.attendence_policy_id || 1,
//       isManual: true
//     });

//     return res.status(201).json({
//       success: true,
//       msg: 'Clock-in recorded!',
//       data: {
//         clock_in: todayLog.clock_in,
//         user_name: existUser.name,
//         employee_id: existUser.employee_id,
//         avatar: existUser.avatar,
//         region: existUser.location ? existUser.location.location_name : '',
//         area: existUser.area ? existUser.area.area_name : ''
//       }
//     });
//   }

//   // Clock-out (overwrite previous clock_out)
//   todayLog.clock_out = currentTime;
//   await todayLog.save();

//   return res.status(200).json({
//     success: true,
//     msg: 'Clock-out recorded!',
//     data: {
//       clock_in: todayLog.clock_in,
//       clock_out: todayLog.clock_out,
//       user_name: existUser.name,
//       employee_id: existUser.employee_id,
//       avatar: existUser.avatar,
//       region: existUser.location ? existUser.location.location_name : '',
//       area: existUser.area ? existUser.area.area_name : ''
//     }
//   });
// });

//@route    /api/attendance/set-policies
//@desc     get
//@access   protected by admin
const getSetPolicies = asyncHandler(async (req, res, next) => {
  const { count, rows } = await AttendancePolicyHistory.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "employee_id"],
        // include: [
        //   {
        //     model: Location,
        //     as: 'location',
        //     attributes: ['id', 'location_name'],
        //     required: false
        //   },
        //   {
        //     model: Area,
        //     as: 'area',
        //     attributes: ['id', 'area_name'],
        //     required: false
        //   }
        // ]
      },
      {
        model: AttendencePolicy,
        as: "attendence_policy",
        attributes: [
          "id",
          "working_days",
          "work_start_time",
          "work_end_time",
          "late_grace_period",
          "overtime_threshold",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    raw: true,
  });

  if (!rows || rows.length === 0) {
    return next(new ErrorResponse("Not found!", 400));
  }

  return res.status(200).json({
    success: true,
    msg: "All Assigned policies!",
    data: rows,
  });
});

// Util to generate working dates
function getWorkingDates(startDate, endDate, workingDays) {
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const workingDayNums = workingDays?.map((day) => dayMap[day]);
  let dates = [];

  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isSameOrBefore(end, "day")) {
    if (workingDayNums?.includes(current.day())) {
      dates.push(current.format("YYYY-MM-DD"));
    }
    current = current.add(1, "day");
  }

  return dates;
}

//@route    /api/attendance/report?start_date=01-05-2025:00:00:00&end_date=01-05-2025:00:00:00&user_id=all&area_id=all&location_id=all
//@desc     get :: start_date and end_date will be checked in PolicyHistory table
//@access   protected

const attendanceReport = asyncHandler(async (req, res, next) => {

  const {
    start_date,
    end_date,
    user_id,
    location_id,
    area_id,
    rff_point_id,
    designation_id,
    status,
    hasFingerprint,
  } = req.query;
  const userId = req.params.user_id;
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  // Build user filter for location and area
  let userFilter = {
    isActive: 1,
  };

  if (req.user.roles.some(role => role.name === 'admin' || role.name === 'super-admin')) {
    if (rff_point_id) {
      userFilter.rff_point_id = rff_point_id;
    }
  }
  else {
    userFilter.rff_point_id = req.user.rff_point_id;
  }

  if (location_id) {
    userFilter.location_id = location_id;
  }
  if (area_id) {
    userFilter.area_id = area_id;
  }
  // if (rff_point_id) {
  //   userFilter.rff_point_id = rff_point_id;
  // }
  if (designation_id) {
    userFilter.designation_id = designation_id;
  }

  // Fingerprint filter
  if (hasFingerprint !== undefined) {
    if (
      hasFingerprint === "true" ||
      hasFingerprint === true ||
      hasFingerprint === "1"
    ) {
      // Users with fingerprint (fingerprint_template is not null)
      userFilter.fingerprint_template = {
        [Op.not]: null,
      };
    } else if (
      hasFingerprint === "false" ||
      hasFingerprint === false ||
      hasFingerprint === "0"
    ) {
      // Users without fingerprint (fingerprint_template is null)
      userFilter.fingerprint_template = {
        [Op.is]: null,
      };
    }
  }

  // Get attendance data with location and area filtering
  const where = {
    clock_in: {
      [Op.between]: [startDate, endDate],
    },
  };

  // Add user_id filter if provided
  if (user_id) where.user_id = user_id;

  const queryOptionsUsers = {
    where,
    // offset,
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "id",
          "name",
          "location_id",
          "area_id",
          "rff_point_id",
          "employee_id",
          "fingerprint_template",
          "designation_id",
        ],
        where: userFilter, // Apply location/area filter here
        include: [
          {
            model: Location, // Assuming you have a Location model
            as: "location",
            attributes: ["id", "location_name"],
            required: false,
          },
          {
            model: Area, // Assuming you have an Area model
            as: "area",
            attributes: ["id", "area_name"],
            required: false,
          },
          {
            model: RffPoint,
            as: "rffPoint",
            attributes: ["id", "name", "rff_sub_code"],
            required: false,
          },
          {
            model: Designation,
            as: "designation",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    ],
    raw: true,
  };
  // if (perPage > 0) {
  //   queryOptionsUsers.limit = perPage;
  // }
  const { count, rows } = await Attendence.findAndCountAll(queryOptionsUsers);

  // Get policy histories with location and area filtering
  const policyHistories = await AttendancePolicyHistory.findAll({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: endDate } },
        {
          [Op.or]: [{ end_date: { [Op.gte]: startDate } }, { end_date: null }],
        },
      ],
      ...(user_id && { user_id }),
    },
    include: [
      {
        model: AttendencePolicy,
        as: "attendence_policy",
        attributes: [
          "id",
          "working_days",
          "work_start_time",
          "work_end_time",
          "late_grace_period",
          "overtime_threshold",
        ],
      },
      {
        model: User,
        as: "user",
        attributes: [
          "id",
          "name",
          "location_id",
          "area_id",
          "rff_point_id",
          "fingerprint_template",
          "designation_id",
          "employee_id",
        ],
        where: userFilter, // Apply same filter to policy histories
        required: true,
        include: [
          {
            model: Location,
            as: "location",
            attributes: ["id", "location_name"],
            required: false,
          },
          {
            model: Area,
            as: "area",
            attributes: ["id", "area_name"],
            required: false,
          },
          {
            model: RffPoint,
            as: "rffPoint",
            attributes: ["id", "name", "rff_sub_code"],
            required: false,
          },
          {
            model: Designation,
            as: "designation",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    ],
    raw: true,
  });

  const userPolicyMap = {}; // { userId_dateStr: policyDetails }
  for (const policy of policyHistories) {
    const uId = policy.user_id;
    const pStart = new Date(policy.start_date);
    const pEnd = policy.end_date ? new Date(policy.end_date) : endDate;

    const policyDetails = {
      working_days: policy["attendence_policy.working_days"],
      work_start_time: policy["attendence_policy.work_start_time"],
      work_end_time: policy["attendence_policy.work_end_time"],
      late_grace_period: policy["attendence_policy.late_grace_period"],
      overtime_threshold: policy["attendence_policy.overtime_threshold"],
      policy_id: policy.attendence_policy_id,
    };

    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = dayjs(current).format("YYYY-MM-DD");
      if (current >= pStart && current <= pEnd) {
        userPolicyMap[`${uId}_${dateStr}`] = policyDetails;
      }
      current.setDate(current.getDate() + 1);
    }
  }

  const userSummary = {};
  // return res.status(200).json({
  //     success: true,
  //     data: rows
  //   });

  for (const record of rows) {
    const uId = record.user_id;
    const eId = record["user.employee_id"];
    const userName = record["user.name"];
    const userLocationId = record["user.location_id"];
    const userAreaId = record["user.area_id"];
    const userDesignationId = record["user.designation_id"];
    const locationName =
      record["user.location.location_name"] || "Unknown Location";
    const areaName = record["user.area.area_name"] || "Unknown Area";
    const rff_point_id = record["user.rffPoint.rff_point_id"];
    const rff_name = record["user.rffPoint.name"] || "Unknown Rff Point";
    const designationName =
      record["user.designation.name"] || "Unknown Designation";
    const hasFingerprint = record["user.fingerprint_template"] ? true : false;

    const dateStr = dayjs(record.clock_in).format("YYYY-MM-DD");
    const clockInTime = record.clock_in;
    const clockOutTime = record.clock_out;
    const attendance_in_location = record?.location?.clock_in || "";
    const attendance_out_location = record?.location?.clock_out || "";
    const in_remarks = record?.remarks?.clock_in || "";
    const out_remarks = record?.remarks?.clock_out || "";

    const policy = userPolicyMap[`${uId}_${dateStr}`];
    if (!policy) continue;

    const workingDates = getWorkingDates(
      dateStr,
      dateStr,
      policy?.working_days
    );
    const isWorkingDay = workingDates.includes(dateStr);

    if (!userSummary[uId]) {
      userSummary[uId] = {
        user_id: uId,
        employee_id: eId,
        user_name: userName,
        location_id: userLocationId,
        location_name: locationName,
        area_id: userAreaId,
        area_name: areaName,
        rff_point_id: rff_point_id,
        rff_name: rff_name,
        designation_id: userDesignationId,
        designation_name: designationName,
        hasFingerprint: hasFingerprint,
        totalWorkingDays: 0,
        present: 0,
        absent: 0,
        trackedDates: new Set(),
        clockInTime: new Set(),
        clockOutTime: new Set(),
        lateMinutes: 0,
        overtimeMinutes: 0,
        policy_ids: new Set(),
        isManual: [],
        attendance_in_location: [],
        attendance_out_location: [],
        in_remarks: [],
        out_remarks: [],
      };
    }

    if (isWorkingDay && !userSummary[uId].trackedDates.has(dateStr)) {
      userSummary[uId].present += 1;
      userSummary[uId].trackedDates.add(dateStr);

      const clockIn = dayjs(record.clock_in);
      const clockOut = record.clock_out ? dayjs(record.clock_out) : null;
      const isManual = record.isManual;
      const workStart = dayjs(
        `${dateStr} ${policy.work_start_time}`,
        "YYYY-MM-DD HH:mm"
      );
      const workEnd = dayjs(
        `${dateStr} ${policy.work_end_time}`,
        "YYYY-MM-DD HH:mm"
      );
      const grace = parseInt(policy.late_grace_period || 0);
      const otThreshold = parseInt(policy.overtime_threshold || 0);

      // Late calculation
      if (clockIn.isAfter(workStart.add(grace, "minute"))) {
        const late = clockIn.diff(workStart, "minute");
        userSummary[uId].lateMinutes += late;
      }

      // Overtime calculation
      if (clockOut && clockOut.isAfter(workEnd.add(otThreshold, "minute"))) {
        const overtime = clockOut.diff(workEnd, "minute");
        userSummary[uId].overtimeMinutes += overtime;
      }

      userSummary[uId].policy_ids.add(policy.policy_id);
      userSummary[uId].clockInTime.add(clockInTime);
      userSummary[uId].clockOutTime.add(clockOutTime);
      userSummary[uId].isManual.push(isManual);
      userSummary[uId].attendance_in_location.push(attendance_in_location);
      userSummary[uId].attendance_out_location.push(attendance_out_location);
      userSummary[uId].in_remarks.push(in_remarks);
      userSummary[uId].out_remarks.push(out_remarks);
    }
  }
  // return res.json(policyHistories)
  // Calculate total working days for each user
  for (const key in userPolicyMap) {
    const [uId, dateStr] = key.split("_");
    const policy = userPolicyMap[key];
    const workingDates = getWorkingDates(
      dateStr,
      dateStr,
      policy?.working_days
    );

    if (!userSummary[uId]) {
      // Get user details for users with policies but no attendance
      const userWithPolicy = policyHistories.find(
        (p) => p.user_id.toString() === uId
      );
      if (userWithPolicy) {
        userSummary[uId] = {
          user_id: uId,
          employee_id: userWithPolicy["user.employee_id"],
          user_name: userWithPolicy["user.name"] || "",
          location_id: userWithPolicy["user.location_id"],
          location_name:
            userWithPolicy["user.location.location_name"] || "Unknown Location",
          area_id: userWithPolicy["user.area_id"],
          rff_point_id: userWithPolicy["user.rff_point_id"],
          rff_name: userWithPolicy["user.rffPoint.name"],
          area_name: userWithPolicy["user.area.area_name"] || "Unknown Area",
          designation_id:
            userWithPolicy["user.designation.designation_id"] ||
            "Unknown Designation",
          designation_name:
            userWithPolicy["user.designation.name"] || "Unknown Designation",
          hasFingerprint: userWithPolicy["user.hasFingerprint"] ? true : false,
          totalWorkingDays: 0,
          present: 0,
          absent: 0,
          trackedDates: new Set(),
          lateMinutes: 0,
          overtimeMinutes: 0,
          policy_ids: new Set(),
          offDayWorked: 0,

        };
      }
    }

    if (userSummary[uId] && workingDates.includes(dateStr)) {
      userSummary[uId].totalWorkingDays += 1;
    }
  }

  // After building userSummary, integrate holidays
  const userIds = Object.keys(userSummary);
  const holidayPromises = userIds.map(async (userId) => {
    const holidays = await getUserHolidaysForDateRange(
      parseInt(userId),
      startDate,
      endDate
    );
    return { userId, holidays };
  });

  const userHolidaysData = await Promise.all(holidayPromises);
  const userHolidaysMap = {};

  userHolidaysData.forEach(({ userId, holidays }) => {
    userHolidaysMap[userId] = holidays.map((h) =>
      dayjs(h.date).format("YYYY-MM-DD")
    );
  });

  // Recalculate working days excluding holidays
  for (const userId in userSummary) {
    const user = userSummary[userId];
    const userHolidays = userHolidaysMap[userId] || [];

    // Recalculate total working days excluding holidays
    let adjustedWorkingDays = 0;
    let current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = dayjs(current).format("YYYY-MM-DD");
      const policy = userPolicyMap[`${userId}_${dateStr}`];

      if (policy) {
        const workingDates = getWorkingDates(
          dateStr,
          dateStr,
          policy.working_days
        );
        const isWorkingDay = workingDates.includes(dateStr);
        const isHoliday = userHolidays.includes(dateStr);

        if (isWorkingDay && !isHoliday) {
          adjustedWorkingDays += 1;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    user.totalWorkingDays = adjustedWorkingDays;
    user.holidays = userHolidays;
    user.holidayCount = userHolidays.length;
  }

  // Build final result with holiday information
  const result = Object.values(userSummary).map((user) => ({
    user_id: user.user_id,
    employee_id: user.employee_id,
    user_name: user.user_name,
    location_id: user.location_id,
    location_name: user.location_name,
    area_id: user.area_id,
    area_name: user.area_name,
    rff_point_id: user.rff_point_id,
    rff_name: user.rff_name,
    designation_id: user.designation_id,
    designation_name: user.designation_name,
    hasFingerprint: user.hasFingerprint,
    working_days: user.totalWorkingDays,
    present_days: user.present,
    absent_days: user.totalWorkingDays - user.present,
    holiday_count: user.holidayCount || 0,
    holidays: user.holidays || [],
    late_days: user.lateMinutes > 0 ? user.trackedDates.size : 0,
    late_minutes: user.lateMinutes,
    overtime_minutes: user.overtimeMinutes,
    present_percent:
      user.totalWorkingDays > 0
        ? ((user.present / user.totalWorkingDays) * 100).toFixed(2)
        : "0.00",
    policy_ids: Array.from(user.policy_ids),
    clock_in: user.clockInTime ? Array.from(user.clockInTime) : null,
    clock_out: user.clockOutTime ? Array.from(user.clockOutTime) : null,
    isManual: user.isManual ? Array.from(user.isManual) : null,
    attendance_in_location: user.attendance_in_location
      ? Array.from(user.attendance_in_location)
      : null,
    attendance_out_location: user.attendance_out_location
      ? Array.from(user.attendance_out_location)
      : null,
    in_remarks: user.in_remarks ? Array.from(user.in_remarks) : null,
    out_remarks: user.out_remarks ? Array.from(user.out_remarks) : null,
  }));

  // Add summary statistics by location and area and rff
  const summaryStats = {
    total_users: result.length,
    locations: {},
    areas: {},
    rffs: {},
    overall: {
      total_working_days: result.reduce(
        (sum, user) => sum + user.working_days,
        0
      ),
      total_present_days: result.reduce(
        (sum, user) => sum + user.present_days,
        0
      ),
      total_absent_days: result.reduce(
        (sum, user) => sum + user.absent_days,
        0
      ),
      average_attendance:
        result.length > 0
          ? (
            result.reduce(
              (sum, user) => sum + parseFloat(user.present_percent),
              0
            ) / result.length
          ).toFixed(2)
          : "0.00",
    },
  };

  // Group statistics by location
  result.forEach((user) => {
    const locKey = `${user.location_id}_${user.location_name}`;
    if (!summaryStats.locations[locKey]) {
      summaryStats.locations[locKey] = {
        location_id: user.location_id,
        location_name: user.location_name,
        user_count: 0,
        total_working_days: 0,
        total_present_days: 0,
        total_absent_days: 0,
        average_attendance: 0,
      };
    }
    summaryStats.locations[locKey].user_count += 1;
    summaryStats.locations[locKey].total_working_days += user.working_days;
    summaryStats.locations[locKey].total_present_days += user.present_days;
    summaryStats.locations[locKey].total_absent_days += user.absent_days;
  });

  // Calculate average attendance for each location
  Object.keys(summaryStats.locations).forEach((locKey) => {
    const loc = summaryStats.locations[locKey];
    loc.average_attendance =
      loc.user_count > 0
        ? (
          result
            .filter((u) => u.location_id === loc.location_id)
            .reduce(
              (sum, user) => sum + parseFloat(user.present_percent),
              0
            ) / loc.user_count
        ).toFixed(2)
        : "0.00";
  });

  // Group statistics by area
  result.forEach((user) => {
    const areaKey = `${user.area_id}_${user.area_name}`;
    if (!summaryStats.areas[areaKey]) {
      summaryStats.areas[areaKey] = {
        area_id: user.area_id,
        area_name: user.area_name,
        user_count: 0,
        total_working_days: 0,
        total_present_days: 0,
        total_absent_days: 0,
        average_attendance: 0,
      };
    }
    summaryStats.areas[areaKey].user_count += 1;
    summaryStats.areas[areaKey].total_working_days += user.working_days;
    summaryStats.areas[areaKey].total_present_days += user.present_days;
    summaryStats.areas[areaKey].total_absent_days += user.absent_days;
  });

  // Calculate average attendance for each area
  Object.keys(summaryStats.areas).forEach((areaKey) => {
    const area = summaryStats.areas[areaKey];
    area.average_attendance =
      area.user_count > 0
        ? (
          result
            .filter((u) => u.area_id === area.area_id)
            .reduce(
              (sum, user) => sum + parseFloat(user.present_percent),
              0
            ) / area.user_count
        ).toFixed(2)
        : "0.00";
  });

  // Group statistics by rff
  result.forEach((user) => {
    const rffKey = `${user.rff_point_id}_${user.rff_name}`;
    if (!summaryStats.rffs[rffKey]) {
      summaryStats.rffs[rffKey] = {
        rff_point_id: user.rff_point_id,
        rff_name: user.rff_name,
        user_count: 0,
        total_working_days: 0,
        total_present_days: 0,
        total_absent_days: 0,
        average_attendance: 0,
      };
    }
    summaryStats.rffs[rffKey].user_count += 1;
    summaryStats.rffs[rffKey].total_working_days += user.working_days;
    summaryStats.rffs[rffKey].total_present_days += user.present_days;
    summaryStats.rffs[rffKey].total_absent_days += user.absent_days;
  });

  // Calculate average attendance for each rff
  Object.keys(summaryStats.rffs).forEach((rffKey) => {
    const rff = summaryStats.rffs[rffKey];
    rff.average_attendance =
      rff.user_count > 0
        ? (
          result
            .filter((u) => u.rff_point_id === rff.rff_point_id)
            .reduce(
              (sum, user) => sum + parseFloat(user.present_percent),
              0
            ) / rff.user_count
        ).toFixed(2)
        : "0.00";
  });

  // Convert location and area and rffs objects to arrays
  summaryStats.locations = Object.values(summaryStats.locations);
  summaryStats.areas = Object.values(summaryStats.areas);
  summaryStats.rffs = Object.values(summaryStats.rffs);

  // Filter based on present/absent status if provided
  let filteredResult = result;
  let finalSummaryStats = summaryStats;

  if (status) {
    const statusLower = status.toLowerCase();
    if (statusLower === "present") {
      filteredResult = result.filter((user) => user.present_days > 0);
    } else if (statusLower === "absent") {
      filteredResult = result.filter((user) => user.absent_days > 0);
    }

    // Recalculate summary statistics for filtered data
    const filteredSummaryStats = {
      total_users: filteredResult.length,
      locations: {},
      areas: {},
      rffs: {},
      overall: {
        total_working_days: filteredResult.reduce(
          (sum, user) => sum + user.working_days,
          0
        ),
        total_present_days: filteredResult.reduce(
          (sum, user) => sum + user.present_days,
          0
        ),
        total_absent_days: filteredResult.reduce(
          (sum, user) => sum + user.absent_days,
          0
        ),
        average_attendance:
          filteredResult.length > 0
            ? (
              filteredResult.reduce(
                (sum, user) => sum + parseFloat(user.present_percent),
                0
              ) / filteredResult.length
            ).toFixed(2)
            : "0.00",
      },
    };

    // Recalculate location stats with filtered data
    filteredResult.forEach((user) => {
      const locKey = `${user.location_id}_${user.location_name}`;
      if (!filteredSummaryStats.locations[locKey]) {
        filteredSummaryStats.locations[locKey] = {
          location_id: user.location_id,
          location_name: user.location_name,
          user_count: 0,
          total_working_days: 0,
          total_present_days: 0,
          total_absent_days: 0,
          average_attendance: 0,
        };
      }
      filteredSummaryStats.locations[locKey].user_count += 1;
      filteredSummaryStats.locations[locKey].total_working_days +=
        user.working_days;
      filteredSummaryStats.locations[locKey].total_present_days +=
        user.present_days;
      filteredSummaryStats.locations[locKey].total_absent_days +=
        user.absent_days;
    });

    // Calculate average attendance for each location with filtered data
    Object.keys(filteredSummaryStats.locations).forEach((locKey) => {
      const loc = filteredSummaryStats.locations[locKey];
      loc.average_attendance =
        loc.user_count > 0
          ? (
            filteredResult
              .filter((u) => u.location_id === loc.location_id)
              .reduce(
                (sum, user) => sum + parseFloat(user.present_percent),
                0
              ) / loc.user_count
          ).toFixed(2)
          : "0.00";
    });

    // Recalculate area stats with filtered data
    filteredResult.forEach((user) => {
      const areaKey = `${user.area_id}_${user.area_name}`;
      if (!filteredSummaryStats.areas[areaKey]) {
        filteredSummaryStats.areas[areaKey] = {
          area_id: user.area_id,
          area_name: user.area_name,
          user_count: 0,
          total_working_days: 0,
          total_present_days: 0,
          total_absent_days: 0,
          average_attendance: 0,
        };
      }
      filteredSummaryStats.areas[areaKey].user_count += 1;
      filteredSummaryStats.areas[areaKey].total_working_days +=
        user.working_days;
      filteredSummaryStats.areas[areaKey].total_present_days +=
        user.present_days;
      filteredSummaryStats.areas[areaKey].total_absent_days += user.absent_days;
    });

    // Calculate average attendance for each area with filtered data
    Object.keys(filteredSummaryStats.areas).forEach((areaKey) => {
      const area = filteredSummaryStats.areas[areaKey];
      area.average_attendance =
        area.user_count > 0
          ? (
            filteredResult
              .filter((u) => u.area_id === area.area_id)
              .reduce(
                (sum, user) => sum + parseFloat(user.present_percent),
                0
              ) / area.user_count
          ).toFixed(2)
          : "0.00";
    });

    // Recalculate rff stats with filtered data
    filteredResult.forEach((user) => {
      const rffKey = `${user.rff_point_id}_${user.rff_name}`;
      if (!filteredSummaryStats.rffs[rffKey]) {
        filteredSummaryStats.rffs[rffKey] = {
          rff_point_id: user.rff_point_id,
          rff_name: user.rff_name,
          user_count: 0,
          total_working_days: 0,
          total_present_days: 0,
          total_absent_days: 0,
          average_attendance: 0,
        };
      }
      filteredSummaryStats.rffs[rffKey].user_count += 1;
      filteredSummaryStats.rffs[rffKey].total_working_days += user.working_days;
      filteredSummaryStats.rffs[rffKey].total_present_days += user.present_days;
      filteredSummaryStats.rffs[rffKey].total_absent_days += user.absent_days;
    });

    // Calculate average attendance for each rff with filtered data
    Object.keys(filteredSummaryStats.rffs).forEach((rffKey) => {
      const rff = filteredSummaryStats.rffs[rffKey];
      rff.average_attendance =
        rff.user_count > 0
          ? (
            filteredResult
              .filter((u) => u.rff_point_id === rff.rff_point_id)
              .reduce(
                (sum, user) => sum + parseFloat(user.present_percent),
                0
              ) / rff.user_count
          ).toFixed(2)
          : "0.00";
    });

    // Convert location and area and rffs objects to arrays for filtered stats
    filteredSummaryStats.locations = Object.values(
      filteredSummaryStats.locations
    );
    filteredSummaryStats.areas = Object.values(filteredSummaryStats.areas);
    filteredSummaryStats.rffs = Object.values(filteredSummaryStats.rffs);

    finalSummaryStats = filteredSummaryStats;
  }

  switch (req?.query?.format?.toLowerCase()) {
    case "excel":
      return await handleExcelExport(res, filteredResult, {
        startDate,
        endDate,
        summaryStats: finalSummaryStats,
        filters: {
          location_id,
          area_id,
          user_id,
          designation_id,
          rff_point_id,
          status,
        },
      });

    case "pdf":
      return await handlePDFExport(res, filteredResult, {
        startDate,
        endDate,
        summaryStats: finalSummaryStats,
        filters: {
          location_id,
          area_id,
          user_id,
          designation_id,
          rff_point_id,
          status,
        },
      });

    default:
      return res.status(200).json({
        success: true,
        msg: "Report generated successfully",
        // page,
        // pages: Math.ceil(count / perPage),
        count: filteredResult.length, // Updated to reflect filtered count
        data: filteredResult,
        summary: finalSummaryStats,
        filters: {
          start_date,
          end_date,
          user_id,
          location_id,
          area_id,
          rff_point_id,
          designation_id,
          status,
        },
      });
  }
});

async function handleExcelExport(res, data, options) {
  try {
    const reportData = data.data || data;

    const { startDate, endDate } = options || {};
    const formattedStart = DateUtils.formatDate(startDate, "YYYY-MM-DD");
    const formattedEnd = DateUtils.formatDate(endDate, "YYYY-MM-DD");
    const filename = `attendance_report_${formattedStart}_to_${formattedEnd}.xlsx`;

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const workbook = await ExcelExportService.generateExcel(reportData, {
      ...options,
      formattedStart,
      formattedEnd,
    });
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    throw new ErrorResponse(`Excel export failed: ${error.message}`);
  }
}

async function handlePDFExport(res, data, options) {
  try {
    const reportData = data.data || data;
    const doc = await PDFExportService?.generatePDF(reportData, options);

    const filename = `attendance_report_${DateUtils?.formatDate(
      new Date(),
      "YYYY-MM-DD"
    )}.pdf`;
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    throw new ErrorResponse(`PDF export failed: ${error.message}`);
  }
}

//@route    /api/attendance/summary
//@desc     get
//@access   protected by admin
const getSummary = asyncHandler(async (req, res, next) => {
  const startDate = dayjs().startOf("day").toDate(); // today at 00:00
  const endDate = dayjs().endOf("day").toDate(); // today at 23:59:59

  const where = {
    clock_in: {
      [Op.between]: [startDate, endDate],
    },
  };

  const { count, rows } = await Attendence.findAndCountAll({
    where,
    // limit:10,
    attributes: ["clock_in", "clock_out", "isManual"],
    order: [["createdAt", "ASC"]],
    include: [
      {
        model: User,
        as: "user",
        required: true,
        where: {
          isActive: 1,
        },
        attributes: ["name", "employee_id"],
      },
      {
        model: AttendencePolicy,
        as: "attendence_policy",
        attributes: ["work_start_time", "work_end_time"],
      },
    ],
    raw: true,
  });

  // Count manual entries
  const manualCount = await Attendence.count({
    where: {
      ...where,
      isManual: true,
    },
    include: [
      {
        model: User,
        as: "user",
        required: true,
        where: {
          isActive: 1,
        },
      },
    ],
  });
  //count total users
  const { count: totalEmployee } = await User.findAndCountAll({
    where: {
      isActive: 1,
    },
    include: [
      {
        model: Role,
        as: "roles",
        where: {
          name: "user",
        },
        through: {
          attributes: [],
        },
        attributes: [],
      },
    ],
  });

  //count enrolled users
  const { count: fingerprintEnrolledEmployee } = await User.findAndCountAll({
    where: {
      isActive: 1,
      fingerprint_template: { [Op.ne]: null },
    },
    include: [
      {
        model: Role,
        as: "roles",
        where: { name: "user" },
        through: { attributes: [] },
        attributes: [],
      },
    ],
  });


  //count active rff points
  const { count: rffPointsCount } = await RffPoint.findAndCountAll({
    where: {
      isActive: 1,
    },
  });

  //all count
  const { count: rffPointsCountAll } = await RffPoint.findAndCountAll({});

  return res.status(200).json({
    success: true,
    msg: "Today's Attendance Retrieved!",
    data: rows,
    total_employee: totalEmployee,
    total_fingerprint_enrolled: fingerprintEnrolledEmployee,
    total_fingerprint_unenrolled: totalEmployee - fingerprintEnrolledEmployee,
    total_present: count,
    manual_count: manualCount,
    total_absent: fingerprintEnrolledEmployee - count,
    total_rff_points: rffPointsCountAll,
    total_active_rff_points: rffPointsCount,
    on_leave: 0,
  });
});

module.exports = {
  clockIn,
  clockOut,
  attendanceReport,
  getSummary,
  getSetPolicies,
};
