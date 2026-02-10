// yeh same onlineUsers Map use karega
const { onlineUsers } = require("../socketStore");

const getUserStatus = (req, res) => {
  const { userId } = req.params;
  const online = onlineUsers.has(userId);
  res.json({ online });
};

module.exports = { getUserStatus };
