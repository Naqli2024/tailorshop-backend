const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    default: Date.now,
  },

  paymentMode: {
    type: String,
    enum: [
      "Cash",
      "UPI",
      "Card",
      "Bank Transfer",
      "Cheque",
    ],
    required: true,
  },

  referenceNo: {
    type: String,
    default: "",
  },

  amount: {
    type: Number,
    required: true,
  },

  paymentType: {
    type: String,
    enum: ["Advance", "Partial", "Final"],
    required: true,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    billingItems: [
      {
        itemName: String,

        description: String,

        qty: Number,

        rate: Number,

        amount: Number,
      },
    ],

    totals: {
      subTotal: Number,

      discount: {
        type: Number,
        default: 0,
      },

      taxableAmount: Number,

      gstPercentage: {
        type: Number,
        default: 0,
      },

      cgst: {
        type: Number,
        default: 0,
      },

      sgst: {
        type: Number,
        default: 0,
      },

      igst: {
        type: Number,
        default: 0,
      },

      grandTotal: Number,
    },

    payments: [paymentSchema],

    ledger: {
      totalAmount: Number,

      paidAmount: {
        type: Number,
        default: 0,
      },

      balanceAmount: Number,

      paymentStatus: {
        type: String,
        enum: [
          "Pending",
          "Partially Paid",
          "Paid",
        ],
        default: "Pending",
      },
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Active",
        "Cancelled",
      ],
      default: "Active",
    },

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
  }
);

module.exports = mongoose.model(
  "Invoice",
  invoiceSchema
);