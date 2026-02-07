const isManager = (req, res, next) => {
  if (req.user && req.user.role === "manager") {
    next(); // ✅ allow
  } else {
    res.status(403).json({
      message: "Access denied. Manager only.",
    });
  }
};

module.exports = { isManager };
