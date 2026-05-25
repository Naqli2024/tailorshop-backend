const Ledger = require("../models/Ledger");
const Customer = require("../models/Customer");

// GET CUSTOMER LEDGER
exports.getCustomerLedger = async (req, res) => {
  try {
    const { customerNo } = req.params;
    const businessId = req.user.businessId;

    // Find customer
    const customer = await Customer.findOne({
      businessId,
      customerNo,
      isDeleted: false,
    }).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Ledger entries
    const ledgerEntries = await Ledger.find({
      businessId,
      customer: customer._id,
      isDeleted: false,
    })
      .populate(
        "invoice",
        "invoiceNo totals.grandTotal ledger.paymentStatus status"
      )
      .sort({ transactionDate: 1 })
      .lean();

    const currentBalance =
      ledgerEntries.length > 0
        ? ledgerEntries[ledgerEntries.length - 1].balance
        : 0;

    const totalDebit = ledgerEntries.reduce(
      (sum, item) => sum + (item.debit || 0),
      0
    );

    const totalCredit = ledgerEntries.reduce(
      (sum, item) => sum + (item.credit || 0),
      0
    );

    return res.status(200).json({
      success: true,

      customer: {
        customerNo: customer.customerNo,
        fullName: customer.fullName,
        phone: customer.phone,
      },

      summary: {
        totalEntries: ledgerEntries.length,
        totalDebit,
        totalCredit,
        currentBalance,
      },

      data: ledgerEntries,
    });
  } catch (error) {
    console.error("Get Customer Ledger Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer ledger",
    });
  }
};