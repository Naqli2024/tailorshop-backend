const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    empNo: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    joinedDate: {
      type: Date,
      required: true,
    },

    salaryPerMonth: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },

    skills: [
      {
        type: String,
      },
    ],

    notes: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    dailyCapacityPoints: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.index(
  {
    businessId: 1,
    empNo: 1,
  },
  {
    unique: true,
  },
);

employeeSchema.index(
  {
    businessId: 1,
    phone: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
