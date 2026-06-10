const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  category: String,

  dressType: String,

  pieceName: String,

  quantity: Number,

  serviceDetails: {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    serviceName: String,

    estimatedDays: Number,
  },

  fabricDetails: {
    fabricSource: {
      type: String,
      enum: ["Customer", "Shop Stock", "Vendor Order"],
      default: null,
    },

    fabricImage: {
      type: String,
      default: null,
    },

    fabricImagePath: {
      type: String,
      default: null,
    },

    outerFabric: {
      fabricName: {
        type: String,
        default: "",
      },

      material: {
        type: String,
        default: "",
      },

      color: {
        type: String,
        default: "",
      },

      pattern: {
        type: String,
        default: "",
      },
    },

    lining: {
      required: {
        type: Boolean,
        default: false,
      },

      type: {
        type: String,
      },

      meters: {
        type: Number,
        default: 0,
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
    },

    color: String,

    quantity: {
      type: Number,
      default: 0,
    },
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
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
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
        "Draft",
        "Pending",
        "Assigned",
        "Cutting",
        "Stitching",
        "Trial",
        "Ready",
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

    isDraft: {
      type: Boolean,
      default: false,
    },

    draftCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

jobCardSchema.index(
  {
    businessId: 1,
    jobCardNo: 1,
  },
  {
    unique: true,
  },
);

jobCardSchema.index({
  businessId: 1,
  customer: 1,
});

jobCardSchema.index({
  businessId: 1,
  assignedEmployee: 1,
});

jobCardSchema.index({
  businessId: 1,
  status: 1,
});

jobCardSchema.index({
  businessId: 1,
  deliveryDate: 1,
});

module.exports = mongoose.model("JobCard", jobCardSchema);
