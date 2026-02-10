const express = require("express");
const router = express.Router();

const { getUserStatus } = require("../controllers/statusController");

router.get("/:userId", getUserStatus);

module.exports = router;
