const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  getAllLeaves,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/users", protect, isAdmin, getAllUsers);
router.put("/user/:id/role", protect, isAdmin, updateUserRole);
router.get("/leaves", protect, isAdmin, getAllLeaves);

module.exports = router;
