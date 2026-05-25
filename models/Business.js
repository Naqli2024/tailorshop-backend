const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
    },

    shopCode: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    address: String,

    mobile: {
      type: String,
      required: true,
    },
    otp: String,

    isVerified: {
      type: Boolean,
      default: false,
    },
    gstNo: String,
    businessType: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Business", businessSchema);