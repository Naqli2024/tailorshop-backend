const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    serviceCode: {
      type: String,
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    estimatedDays: {
      type: Number,
      default: 1,
    },

    active: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

serviceSchema.index(
  {
    businessId: 1,
    serviceCode: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Service", serviceSchema);
