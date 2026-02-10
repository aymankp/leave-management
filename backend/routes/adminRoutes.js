
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const {
  addEmployee,
  getAllUsers,
  updateUserRole,
  getAllLeaves,
} = require("../controllers/adminController");

// 🔥 THIS ROUTE
router.post("/add-employee", protect, isAdmin, addEmployee);

// existing routes
router.get("/users", protect, isAdmin, getAllUsers);
router.put("/user/:id/role", protect, isAdmin, updateUserRole);
router.get("/leaves", protect, isAdmin, getAllLeaves);

router.get("/test", (req, res) => {
  res.send("ADMIN ROUTE OK");
});


module.exports = router;
