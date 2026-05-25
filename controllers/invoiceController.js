const Invoice = require("../models/Invoice");
const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Ledger = require("../models/Ledger");
const Business = require("../models/Business");
const generateSequence = require("../utils/generateSequence");

// CREATE INVOICE
exports.createInvoice = async (req, res) => {
  try {
    const { jobCardNo, customerNo, billingItems, totals, payments, notes } =
      req.body;
    const businessId = req.user.businessId;

    // CHECK CUSTOMER
    const customer = await Customer.findOne({
      businessId,
      customerNo,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // CHECK JOB CARD
    const jobCard = await JobCard.findOne({
      businessId,
      jobCardNo,
      isDeleted: false,
    });

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    // GENERATE INVOICE NUMBER
    const nextNumber = await generateSequence(
      businessId,
      `INVOICE_${currentYear}`,
    );

    const invoiceNo = `INV-${currentYear}-${String(nextNumber).padStart(5, "0")}`;

    // CHECK DUPLICATE
    const duplicateInvoice = await Invoice.findOne({
      businessId,
      invoiceNo,
    });

    if (duplicateInvoice) {
      return res.status(400).json({
        success: false,
        message: "Duplicate invoice number detected",
      });
    }

    // CALCULATIONS
    const subTotal = totals.subTotal || 0;

    const discount = totals.discount || 0;

    const taxableAmount = subTotal - discount;

    const gstPercentage = totals.gstPercentage || 0;

    const gstAmount = (taxableAmount * gstPercentage) / 100;

    const cgst = gstAmount / 2;

    const sgst = gstAmount / 2;

    const grandTotal = taxableAmount + gstAmount;

    // PAYMENT CALCULATIONS
    const paidAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    const balanceAmount = grandTotal - paidAmount;

    let paymentStatus = "Pending";

    if (paidAmount > 0 && paidAmount < grandTotal) {
      paymentStatus = "Partially Paid";
    }

    if (paidAmount >= grandTotal) {
      paymentStatus = "Paid";
    }

    // CREATE INVOICE
    const invoice = await Invoice.create({
      businessId,
      invoiceNo,

      jobCard: jobCard._id,

      customer: customer._id,

      billingItems,

      totals: {
        subTotal,
        discount,
        taxableAmount,
        gstPercentage,
        cgst,
        sgst,
        igst: 0,
        grandTotal,
      },

      payments,

      ledger: {
        totalAmount: grandTotal,
        paidAmount,
        balanceAmount,
        paymentStatus,
      },

      notes,
    });

    // GENERATE LEDGER NUMBER
    const ledgerCount = await Ledger.countDocuments({
      businessId,
      ledgerNo: {
        $regex: `^LED-${currentYear}`,
      },
    });

    const ledgerSequence = String(ledgerCount + 1).padStart(5, "0");

    const ledgerNo = `LED-${currentYear}-${ledgerSequence}`;

    // CREATE DEBIT ENTRY
    await Ledger.create({
      businessId,
      ledgerNo,
      customer: customer._id,
      customerNo: customer.customerNo,
      invoice: invoice._id,
      invoiceNo: invoice.invoiceNo,
      jobCardNo,
      transactionType: "Debit",
      description: `Invoice ${invoice.invoiceNo} created`,
      debit: grandTotal,
      credit: 0,
      balance: grandTotal,
      notes,
    });

    // PAYMENT ENTRIES
    let runningBalance = grandTotal;

    for (const payment of payments) {
      runningBalance -= payment.amount;

      const paymentLedgerCount = await Ledger.countDocuments({
        businessId,
        ledgerNo: {
          $regex: `^LED-${currentYear}`,
        },
      });

      const paymentLedgerSequence = String(paymentLedgerCount + 1).padStart(
        5,
        "0",
      );

      const paymentLedgerNo = `LED-${currentYear}-${paymentLedgerSequence}`;

      await Ledger.create({
        businessId,
        ledgerNo: paymentLedgerNo,
        customer: customer._id,
        customerNo: customer.customerNo,
        invoice: invoice._id,
        invoiceNo: invoice.invoiceNo,
        jobCardNo,
        transactionType: "Credit",
        description: `${payment.paymentType} payment received`,
        debit: 0,
        credit: payment.amount,
        balance: runningBalance,
        paymentMode: payment.paymentMode,
        referenceNo: payment.referenceNo,
        notes,
      });
    }

    // CREATE NOTIFICATION
    await Notification.create({
      businessId,
      customer: customer._id,
      customerNo: customer.customerNo,
      title: "Invoice Generated",
      message: `Invoice ${invoiceNo} generated successfully. Pending amount: ₹${balanceAmount}.`,
      type: "Payment Reminder",
      relatedJobCard: jobCard._id,
      relatedJobCardNo: jobCardNo,
      notificationChannel: "System",
    });

    // POPULATE RESPONSE
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("customer")
      .populate("jobCard");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL INVOICES
exports.getAllInvoices = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const invoices = await Invoice.find({
      businessId,
      isDeleted: false,
    })
      .populate("customer")
      .populate("jobCard")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET INVOICE BY INVOICE NO
exports.getInvoiceByInvoiceNo = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { invoiceNo } = req.params;

    const invoice = await Invoice.findOne({
      businessId,
      invoiceNo,
      isDeleted: false,
    })
      .populate("customer")
      .populate("jobCard");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public API invoice
exports.getPublicInvoice = async (req, res) => {
  try {
    const { shopCode, invoiceNo } = req.params;

    const business = await Business.findOne({
      shopCode,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const invoice = await Invoice.findOne({
      businessId: business._id,
      invoiceNo,
      isDeleted: false,
    })
      .populate("customer", "customerNo fullName phone")
      .populate("jobCard", "jobCardNo deliveryDate status");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      business: {
        shopName: business.shopName,
        mobile: business.mobile,
      },
      data: invoice,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// RECEIVE PAYMENT
exports.receivePayment = async (req, res) => {
  try {
    const { invoiceNo } = req.params;

    const { paymentMode, referenceNo, amount, paymentType, notes } = req.body;
    const businessId = req.user.businessId;

    // FIND INVOICE
    const invoice = await Invoice.findOne({
      businessId,
      invoiceNo,
      isDeleted: false,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // CHECK FULLY PAID
    if (invoice.ledger.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice already fully paid",
      });
    }

    // VALIDATE AMOUNT
    if (amount <= 0 || amount > invoice.ledger.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // ADD PAYMENT
    invoice.payments.push({
      paymentDate: new Date(),
      paymentMode,
      referenceNo,
      amount,
      paymentType,
    });

    // CALCULATIONS
    const newPaidAmount = invoice.ledger.paidAmount + amount;

    const newBalanceAmount = invoice.ledger.totalAmount - newPaidAmount;

    let paymentStatus = "Pending";

    if (newPaidAmount > 0 && newBalanceAmount > 0) {
      paymentStatus = "Partially Paid";
    }

    if (newBalanceAmount <= 0) {
      paymentStatus = "Paid";
    }

    // UPDATE LEDGER SECTION
    invoice.ledger.paidAmount = newPaidAmount;

    invoice.ledger.balanceAmount = newBalanceAmount;

    invoice.ledger.paymentStatus = paymentStatus;

    await invoice.save();

    // GET CUSTOMER
    const customer = await Customer.findOne({
      _id: invoice.customer,
      businessId,
      isDeleted: false,
    });

    // GENERATE LEDGER NUMBER
    const currentYear = new Date().getFullYear();

    const ledgerCount = await Ledger.countDocuments({
      businessId,
      ledgerNo: {
        $regex: `^LED-${currentYear}`,
      },
    });

    const sequenceNumber = String(ledgerCount + 1).padStart(5, "0");

    const ledgerNo = `LED-${currentYear}-${sequenceNumber}`;

    // CREATE CREDIT LEDGER ENTRY
    await Ledger.create({
      businessId,
      ledgerNo,
      customer: customer._id,
      customerNo: customer.customerNo,
      invoice: invoice._id,
      invoiceNo: invoice.invoiceNo,
      transactionType: "Credit",
      description: `${paymentType} payment received`,
      debit: 0,
      credit: amount,
      balance: newBalanceAmount,
      paymentMode,
      referenceNo,
      notes,
    });

    // GET JOB CARD
    const jobCard = await JobCard.findOne({
      _id: invoice.jobCard,
      businessId,
      isDeleted: false,
    });

    // CREATE NOTIFICATION
    await Notification.create({
      businessId,
      customer: customer._id,
      customerNo: customer.customerNo,
      title: "Payment Received",
      message: `Payment of ₹${amount} received for invoice ${invoice.invoiceNo}. Remaining balance: ₹${newBalanceAmount}.`,
      type: "Payment Reminder",
      relatedJobCard: jobCard._id,
      relatedJobCardNo: jobCard?.jobCardNo || "",
      notificationChannel: "System",
    });

    // POPULATE RESPONSE
    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate("customer")
      .populate("jobCard");

    res.status(200).json({
      success: true,
      message: "Payment received successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
