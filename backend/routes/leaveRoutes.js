const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const { protect } = require("../middleware/authMiddleware");
const { isManager } = require("../middleware/roleMiddleware");

// EMPLOYEE
router.post("/apply", protect, applyLeave);
router.get("/my", protect, getMyLeaves);

// MANAGER
router.put("/:id/status", protect, isManager, updateLeaveStatus);

module.exports = router;
