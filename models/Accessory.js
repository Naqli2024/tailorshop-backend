const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema(
  {
    accessoryNo: {
      type: String,
      required: true,
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Buttons",
        "Threads",
        "Zippers",
        "Hooks",
        "Elastic",
        "Lace",
        "Lining",
        "Interfacing",
        "Beads",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
    },

    unit: {
      type: String,
      required: true,
    },

    reorderLevel: {
      type: Number,
      default: 0,
    },

    costPerUnit: {
      type: Number,
      default: 0,
    },

    supplier: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
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

accessorySchema.index(
  {
    businessId: 1,
    itemName: 1,
    category: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Accessory", accessorySchema);
