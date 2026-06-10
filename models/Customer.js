const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    customerNo: {
      type: String,
      required: true,
    },

    fullName: {
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

    customerSegment: {
      type: String,
      enum: ["New", "VIP", "Regular"],
      default: "New",
    },

    /*
    ==========================================
    MEASUREMENTS
    ==========================================
    */

    measurements: {
      shirt: {
        shoulder: Number,
        chest: Number,
        waist: Number,
        hip: Number,
        handLength: Number,
        shirtLength: Number,
        neck: Number,
        cuff: Number,
      },

      pant: {
        waist: Number,
        hip: Number,
        thigh: Number,
        knee: Number,
        bottom: Number,
        pantLength: Number,
      },
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

customerSchema.index(
  {
    businessId: 1,
    customerNo: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Customer", customerSchema);
