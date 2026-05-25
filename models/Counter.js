const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    counterName: {
      type: String,
      required: true,
    },

    sequenceValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

counterSchema.index(
  {
    businessId: 1,
    counterName: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Counter", counterSchema);