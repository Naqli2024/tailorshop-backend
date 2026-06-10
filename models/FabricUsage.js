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
    },

    fabricRoll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FabricRoll",
      required: true,
    },

    rollNo: String,

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    customerNo: {
      type: String,
      default: null,
    },

    customerName: {
      type: String,
      default: "",
    },

    fabricName: String,

    fabricType: String,

    color: String,

    usedMeters: {
      type: Number,
      required: true,
    },

    costPerMeter: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    remainingMeters: Number,

    reason: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FabricUsage", fabricUsageSchema);
