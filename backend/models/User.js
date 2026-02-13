const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    team: {
      type: String,
      required: true
    },

    leaveBalance: {
      casual: { type: Number, default: 10 },
      sick: { type: Number, default: 5 }
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
