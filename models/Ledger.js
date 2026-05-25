const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    ledgerNo: {
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

    customerNo: {
      type: String,
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },

    invoiceNo: {
      type: String,
      required: true,
    },

    jobCardNo: {
      type: String,
      default: "",
    },

    transactionDate: {
      type: Date,
      default: Date.now,
    },

    transactionType: {
      type: String,
      enum: ["Debit", "Credit"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    debit: {
      type: Number,
      min: 0,
      default: 0,
    },

    credit: {
      type: Number,
      min: 0,
      default: 0,
    },

    balance: {
      type: Number,
      min: 0,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", ""],
      default: "",
    },

    referenceNo: {
      type: String,
      default: "",
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
  },
);

ledgerSchema.index(
  {
    businessId: 1,
    ledgerNo: 1,
  },
  {
    unique: true,
  }
);

ledgerSchema.index({
  businessId: 1,
  customerNo: 1,
});

ledgerSchema.index({
  businessId: 1,
  invoiceNo: 1,
});

module.exports = mongoose.model("Ledger", ledgerSchema);
