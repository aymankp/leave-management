const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // 🔥 THIS LINE MUST BE HERE
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
