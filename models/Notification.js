const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerNo: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "Job Created",
        "Job Updated",
        "Trial Ready",
        "Ready For Delivery",
        "Payment Reminder",
        "Delivered",
      ],
      required: true,
    },

    relatedJobCardNo: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    deliveryStatus: {
      type: String,
      enum: [
        "Pending",
        "Sent",
        "Failed",
      ],
      default: "Pending",
    },

    notificationChannel: {
      type: String,
      enum: [
        "System",
        "WhatsApp",
        "SMS",
      ],
      default: "System",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);