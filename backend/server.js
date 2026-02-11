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
const User = require("./models/User");

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
app.use("/api/status", statusRoutes);

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

io.on("connection", (socket) => {
  socket.on("user-online", (userId) => {
    userId = String(userId);
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    io.emit("status-update", {
      userId,
      online: true,
    });
  });

  // idle tracker
  socket.on("user-idle", (userId) => {
    userId = String(userId);
    io.emit("status-update", {
      userId,
      idle: true,
    });
  });

  socket.on("disconnect", async () => {
    for (let [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        // If still other tabs open → do nothing
        if (sockets.size > 0) {
          return;
        }
        // All tabs closed → offline
        onlineUsers.delete(userId);
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { lastSeen });
        io.emit("status-update", {
          userId,
          online: false,
          lastSeen,
        });
        break;
      }
    }
  });
});

// ✅ SINGLE server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend + Socket running on port ${PORT}`);
});
