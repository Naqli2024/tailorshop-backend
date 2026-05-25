const mongoose = require("mongoose");

const fabricUsageSchema = new mongoose.Schema(
  {
    transactionNo: {
      type: String,
      required: true,
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    fabricRoll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FabricRoll",
      required: true,
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

// Each business can have its own FUT-00001
fabricUsageSchema.index(
  {
    businessId: 1,
    transactionNo: 1,
  },
  {
    unique: true,
  },
);

// Faster searches
fabricUsageSchema.index({
  businessId: 1,
  rollNo: 1,
});

fabricUsageSchema.index({
  businessId: 1,
  jobCardNo: 1,
});

module.exports = mongoose.model("FabricUsage", fabricUsageSchema);
