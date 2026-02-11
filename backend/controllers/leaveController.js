const Leave = require("../models/Leave");
const applyLeave = async (req, res) => {
    try {
        const { fromDate, toDate, reason } = req.body;

        if (!fromDate || !toDate || !reason) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        const leave = await Leave.create({
            employee: req.user._id, // 🔥 from JWT middleware
            fromDate,
            toDate,
            reason,
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
        const { status } = req.body; // approved / rejected
        const { id } = req.params;   // leave id

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                message: "Leave not found",
            });
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

module.exports = {
    applyLeave,
    getMyLeaves,
    updateLeaveStatus,
    getPendingLeaves,
};


