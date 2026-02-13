const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    leaveType: {
      type: String,
      enum: ["casual", "sick"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
