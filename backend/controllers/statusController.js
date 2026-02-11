const User = require("../models/User");
const { onlineUsers } = require("../socketStore");

const getUserStatus = async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select("lastSeen");

  res.json({
    online: onlineUsers.has(req.params.userId),
    lastSeen: user?.lastSeen,
  });
};

module.exports = { getUserStatus };
