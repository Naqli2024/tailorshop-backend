const Ledger = require("../models/Ledger");
const Customer = require("../models/Customer");


// GET CUSTOMER LEDGER
exports.getCustomerLedger = async (
  req,
  res
) => {
  try {
    const { customerNo } = req.params;

    // CHECK CUSTOMER
    const customer = await Customer.findOne({
      customerNo,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // GET LEDGER ENTRIES
    const ledgerEntries = await Ledger.find({
      customer: customer._id,
      isDeleted: false,
    })
      .populate("invoice")
      .sort({
        createdAt: 1,
      });

    // FINAL BALANCE
    const finalBalance =
      ledgerEntries.length > 0
        ? ledgerEntries[
            ledgerEntries.length - 1
          ].balance
        : 0;

    res.status(200).json({
      success: true,

      customer: {
        customerNo: customer.customerNo,
        fullName: customer.fullName,
        phone: customer.phone,
      },

      totalEntries: ledgerEntries.length,

      currentBalance: finalBalance,

      data: ledgerEntries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};