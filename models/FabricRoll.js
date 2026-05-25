const mongoose = require("mongoose");

const fabricRollSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    fabricName: {
      type: String,
      required: true,
    },

    fabricType: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    pattern: {
      type: String,
      default: "",
    },

    totalMeters: {
      type: Number,
      required: true,
    },

    remainingMeters: {
      type: Number,
      required: true,
    },

    costPerMeter: {
      type: Number,
      default: 0,
    },

    supplier: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    reorderLevel: {
      type: Number,
      default: 10,
    },

    status: {
      type: String,
      enum: ["Full", "Partial", "Empty"],
      default: "Full",
    },

    notes: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

fabricRollSchema.index(
  {
    businessId: 1,
    rollNo: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("FabricRoll", fabricRollSchema);
