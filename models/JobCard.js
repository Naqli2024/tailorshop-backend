const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  category: String,

  dressType: String,

  pieceName: String,

  quantity: Number,

  fabricDetails: {
    fabricSource: {
      type: String,
      enum: ["Customer", "Shop Stock", "Vendor Order"],
    },

    outerFabric: {
      fabricName: String,
      material: String,
      color: String,
      pattern: String,
    },

    lining: {
      required: Boolean,

      type: {
        type: String,
        enum: ["No", "Full Cotton", "Half Cotton", "Full Silk", "Half Silk"],
      },
    },
  },

  styleDetails: {
    handType: String,
    fitType: String,
    collarType: String,
    neckDesign: String,
    cuffStyle: String,
    pocket: Boolean,
  },

  buttonDetails: {
    type: {
      type: String,
      enum: ["Metal", "Plastic", "Fabric"],
    },

    style: String,

    color: String,
  },

  measurements: {
    type: mongoose.Schema.Types.Mixed,
  },

  specialWorks: {
    embroidery: Boolean,
    aariWork: Boolean,
    stoneWork: Boolean,
    customLabel: Boolean,
    notes: String,
  },

  pricing: {
    stitchingCost: Number,
    materialCost: Number,
    extraWorkCost: Number,
    total: Number,
  },

  productionStatus: {
    type: String,
    enum: ["Pending", "Cutting", "Stitching", "Checking", "Ready", "Delivered"],
    default: "Pending",
  },
});

const jobCardSchema = new mongoose.Schema(
  {
    jobCardNo: {
      type: String,
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    deliveryDate: Date,

    trialDate: Date,

    priority: {
      type: String,
      enum: ["Low", "Normal", "Urgent"],
      default: "Normal",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Cutting",
        "Stitching",
        "Trial Pending",
        "In Progress",
        "Completed",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    items: [itemSchema],

    billing: {
      subTotal: Number,
      discount: Number,
      advancePaid: Number,
      balanceAmount: Number,
      grandTotal: Number,
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

module.exports = mongoose.model("JobCard", jobCardSchema);
