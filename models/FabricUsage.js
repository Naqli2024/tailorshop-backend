const mongoose = require("mongoose");

const fabricUsageSchema = new mongoose.Schema(
  {
    transactionNo: {
      type: String,
      unique: true,
    },

    fabricRoll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FabricRoll",
    },

    rollNo: String,

    jobCardNo: String,

    usedMeters: Number,

    remainingMeters: Number,

    reason: String,

    createdBy: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FabricUsage", fabricUsageSchema);
