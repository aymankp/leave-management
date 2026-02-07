const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
// const adminRoutes = require("./routes/adminRoutes");g

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // 🔥 THIS LINE MUST BE HERE
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
// app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);
