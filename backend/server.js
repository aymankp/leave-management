const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statusRoutes = require("./routes/statusRoutes");
const { onlineUsers } = require("./socketStore");


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

// 🔥 SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.use("/api/status", statusRoutes);
io.on("connection", (socket) => {
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("status-update", { userId, online: true });
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("status-update", { userId, online: false });
      }
    }
  });
});


// ✅ SINGLE server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend + Socket running on port ${PORT}`);
});
