const Leave = require("../models/Leave");
const User = require("../models/User");


const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason, leaveType } = req.body;

    if (!fromDate || !toDate || !reason || !leaveType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const leave = await Leave.create({
      employee: req.user._id,
      fromDate,
      toDate,
      reason,
      leaveType
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // First fetch leave
    const leave = await Leave.findById(id).populate("employee");
    console.log("STATUS:", status);
    console.log("LEAVE TYPE:", leave.leaveType);
    console.log("USER BALANCE:", leave.employee.leaveBalance);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    // Only run balance + conflict check if approving
    if (status === "approved") {

      // Conflict check
      const overlappingLeaves = await Leave.countDocuments({
        _id: { $ne: leave._id },
        status: "approved",
        employee: { $ne: leave.employee._id },
        fromDate: { $lte: leave.toDate },
        toDate: { $gte: leave.fromDate },
      });

      const MAX_TEAM_LEAVE = 2;

      if (overlappingLeaves >= MAX_TEAM_LEAVE) {
        return res.status(400).json({
          message: "Conflict: Too many employees already on leave during these dates",
        });
      }

      // 💰 Leave Balance System
      const days =
        (new Date(leave.toDate) - new Date(leave.fromDate)) /
        (1000 * 60 * 60 * 24) +
        1;

      const user = leave.employee;

      if (user.leaveBalance.casual < days) {
        return res.status(400).json({
          message: "Insufficient leave balance",
        });
      }

      user.leaveBalance.casual -= days;
      await user.save({ validateBeforeSave: false });
    }

    leave.status = status;
    await leave.save();

    res.status(200).json({
      message: `Leave ${status} successfully`,
      leave,
    });

  } catch (error) {
    console.error("UPDATE LEAVE ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};


const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "pending" })
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error("PENDING LEAVES ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
//organised data for ai
const getLeaveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id).populate("employee");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const employee = leave.employee;

    const days =
      (new Date(leave.toDate) - new Date(leave.fromDate)) /
        (1000 * 60 * 60 * 24) +
      1;

    // Team conflict
    const overlappingLeaves = await Leave.find({
      _id: { $ne: leave._id },
      status: "approved",
      fromDate: { $lte: leave.toDate },
      toDate: { $gte: leave.fromDate }
    }).populate("employee");

    const teamOverlap = overlappingLeaves.filter(
      l => l.employee.team === employee.team
    ).length;

    // Past leaves count
    const pastLeaves = await Leave.countDocuments({
      employee: employee._id,
      status: "approved"
    });

    let recommendation = "Approve";

    if (employee.leaveBalance[leave.leaveType] < days) {
      recommendation = "Reject: Insufficient leave balance.";
    } else if (teamOverlap >= 2) {
      recommendation = "Risky: Multiple team members already on leave.";
    } else if (pastLeaves > 5) {
      recommendation = "Caution: High leave frequency.";
    }

    res.json({
      recommendation,
      stats: {
        days,
        teamOverlap,
        pastLeaves
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  updateLeaveStatus,
  getPendingLeaves,
  getLeaveRecommendation
};


