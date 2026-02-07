const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isManager } = require("../middleware/roleMiddleware");
const { getPendingLeaves } = require("../controllers/leaveController");

const {
  applyLeave,
  getMyLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");
// EMPLOYEE
router.post("/apply", protect, applyLeave);
router.get("/my", protect, getMyLeaves);
// MANAGER
router.put("/:id/status", protect, isManager, updateLeaveStatus);
// MANAGER: view pending leaves
router.get("/pending", protect, isManager, getPendingLeaves);
module.exports = router;
