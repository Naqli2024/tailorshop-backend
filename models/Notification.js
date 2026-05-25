const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
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

    relatedJobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      default: null,
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
      enum: ["Pending", "Sent", "Failed"],
      default: "Pending",
    },

    notificationChannel: {
      type: String,
      enum: ["System", "WhatsApp", "SMS"],
      default: "System",
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

notificationSchema.index({
  businessId: 1,
  customerNo: 1,
});

notificationSchema.index({
  businessId: 1,
  customer: 1,
});

notificationSchema.index({
  businessId: 1,
  isRead: 1,
});
notificationSchema.index({
  businessId: 1,
  createdAt: -1,
});

notificationSchema.index({
  businessId: 1,
  type: 1,
});

notificationSchema.index({
  businessId: 1,
  deliveryStatus: 1,
});

module.exports = mongoose.model("Notification", notificationSchema);
