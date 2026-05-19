const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    empNo: {
      type: String,
      required: true,
      unique: true,
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
      unique: true,
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Employee", employeeSchema);
