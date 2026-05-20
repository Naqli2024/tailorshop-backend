const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

// CREATE JOB CARD
exports.createJobCard = async (req, res) => {
  try {
    const {
      customerNo,
      empNo,
      deliveryDate,
      trialDate,
      priority,
      items,
      billing,
      notes,
    } = req.body;

    // CHECK CUSTOMER EXISTS
    const customerExists = await Customer.findOne({
      customerNo,
      isDeleted: false,
    });

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // CHECK EMPLOYEE EXISTS
    const employeeExists = await Employee.findOne({
      empNo,
      isDeleted: false,
    });

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Assigned employee not found",
      });
    }

    // GENERATE JOB CARD NUMBER
    const currentYear = new Date().getFullYear();

    // COUNT CURRENT YEAR JOB CARDS
    const yearlyJobCardCount = await JobCard.countDocuments({
      jobCardNo: {
        $regex: `^JC-${currentYear}`,
      },
    });

    // GENERATE NUMBER
    const sequenceNumber = String(yearlyJobCardCount + 1).padStart(5, "0");

    // FINAL JOB CARD NUMBER
    const jobCardNo = `JC-${currentYear}-${sequenceNumber}`;

    // CHECK DUPLICATE
    const duplicateJobCard = await JobCard.findOne({
      jobCardNo,
    });

    if (duplicateJobCard) {
      return res.status(400).json({
        success: false,
        message: "Duplicate job card number detected",
      });
    }

    // CREATE JOB CARD
    const jobCard = await JobCard.create({
      jobCardNo,

      // STORE OBJECT IDS
      customer: customerExists._id,

      assignedEmployee: employeeExists._id,

      deliveryDate,
      trialDate,
      priority,
      items,
      billing,
      notes,
    });

    // CREATE NOTIFICATION
    await Notification.create({
      customer: customerExists._id,

      customerNo: customerExists.customerNo,

      title: "Job Card Created",

      message: `Your tailoring order ${jobCardNo} has been created successfully. Delivery date is ${deliveryDate}.`,

      type: "Job Created",

      relatedJobCardNo: jobCardNo,

      notificationChannel: "System",
    });

    // POPULATE RESPONSE
    const populatedJobCard = await JobCard.findById(jobCard._id)
      .populate("customer")
      .populate("assignedEmployee");

    res.status(201).json({
      success: true,
      message: "Job card created successfully",
      data: populatedJobCard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL JOB CARDS
exports.getAllJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find({
      isDeleted: false,
    })
      .populate("customer")
      .populate("assignedEmployee")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: jobCards.length,
      data: jobCards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET JOB CARD BY JOBCARD NO
exports.getJobCardByJobCardNo = async (req, res) => {
  try {
    const { jobCardNo } = req.params;

    const jobCard = await JobCard.findOne({
      jobCardNo,
      isDeleted: false,
    })
      .populate("customer")
      .populate("assignedEmployee");

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: jobCard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE JOB CARD
exports.updateJobCard = async (req, res) => {
  try {
    const { jobCardNo } = req.params;

    const jobCard = await JobCard.findOne({
      jobCardNo,
      isDeleted: false,
    });

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    const {
      empNo,
      deliveryDate,
      trialDate,
      priority,
      status,
      items,
      billing,
      notes,
    } = req.body;

    // VALIDATE EMPLOYEE USING EMPNO
    if (empNo) {
      const employeeExists = await Employee.findOne({
        empNo,
        isDeleted: false,
      });

      if (!employeeExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned employee not found",
        });
      }

      jobCard.assignedEmployee = employeeExists._id;
    }

    jobCard.deliveryDate =
      deliveryDate || jobCard.deliveryDate;

    jobCard.trialDate =
      trialDate || jobCard.trialDate;

    jobCard.priority =
      priority || jobCard.priority;

    jobCard.status =
      status || jobCard.status;

    jobCard.items =
      items || jobCard.items;

    jobCard.billing =
      billing || jobCard.billing;

    jobCard.notes =
      notes || jobCard.notes;

    await jobCard.save();

    // GET CUSTOMER DETAILS
    const customer = await Customer.findById(
      jobCard.customer
    );

    // CREATE NOTIFICATION
    await Notification.create({
      customer: customer._id,

      customerNo: customer.customerNo,

      title: "Job Card Updated",

      message: `Your tailoring order ${jobCard.jobCardNo} status has been updated to ${jobCard.status}.`,

      type: "Job Updated",

      relatedJobCardNo: jobCard.jobCardNo,

      notificationChannel: "System",
    });

    // POPULATE UPDATED DATA
    const updatedJobCard = await JobCard.findById(
      jobCard._id
    )
      .populate("customer")
      .populate("assignedEmployee");

    res.status(200).json({
      success: true,
      message: "Job card updated successfully",
      data: updatedJobCard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE JOB CARD
exports.deleteJobCard = async (req, res) => {
  try {
    const { jobCardNo } = req.params;

    const jobCard = await JobCard.findOne({
      jobCardNo,
      isDeleted: false,
    });

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    jobCard.isDeleted = true;

    await jobCard.save();

    res.status(200).json({
      success: true,
      message: "Job card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ORDERS BY CUSTOMER NO
exports.getOrdersByCustomerNo = async (req, res) => {
  try {
    const { customerNo } = req.params;

    // CHECK CUSTOMER EXISTS
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

    // GET ALL ORDERS
    const orders = await JobCard.find({
      customer: customer._id,
      isDeleted: false,
    })
      .populate("customer")
      .populate("assignedEmployee")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      customer: {
        customerNo: customer.customerNo,
        fullName: customer.fullName,
        phone: customer.phone,
      },
      totalOrders: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET JOB CARD SUMMARY
exports.getJobCardSummary = async (
  req,
  res
) => {
  try {
    const { jobCardNo } = req.params;

    // FIND JOB CARD
    const jobCard = await JobCard.findOne({
      jobCardNo,
      isDeleted: false,
    })
      .populate("customer")
      .populate("assignedEmployee");

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    // FIND RELATED INVOICES
    const invoices = await Invoice.find({
      jobCard: jobCard._id,
      isDeleted: false,
    });

    // CALCULATIONS
    const totalInvoices = invoices.length;

    const totalInvoiceAmount =
      invoices.reduce(
        (sum, invoice) =>
          sum +
          (invoice.ledger.totalAmount || 0),
        0
      );

    const totalPaidAmount =
      invoices.reduce(
        (sum, invoice) =>
          sum +
          (invoice.ledger.paidAmount || 0),
        0
      );

    const totalPendingAmount =
      invoices.reduce(
        (sum, invoice) =>
          sum +
          (invoice.ledger.balanceAmount || 0),
        0
      );

    // CHECK IF INVOICE GENERATED
    const invoiceGenerated =
      totalInvoices > 0;

    // ESTIMATED ORDER VALUE
    const estimatedOrderValue =
      jobCard.billing?.grandTotal || 0;

    // IF NO INVOICE GENERATED
    const uninvoicedAmount =
      !invoiceGenerated
        ? estimatedOrderValue
        : Math.max(
            estimatedOrderValue -
              totalInvoiceAmount,
            0
          );

    res.status(200).json({
      success: true,

      jobCard: {
        jobCardNo: jobCard.jobCardNo,
        status: jobCard.status,
        priority: jobCard.priority,
        deliveryDate:
          jobCard.deliveryDate,
        trialDate: jobCard.trialDate,
        notes: jobCard.notes,
      },

      customer: {
        customerNo:
          jobCard.customer.customerNo,
        fullName:
          jobCard.customer.fullName,
        phone:
          jobCard.customer.phone,
      },

      assignedEmployee: {
        empNo:
          jobCard.assignedEmployee
            ?.empNo,
        fullName:
          jobCard.assignedEmployee
            ?.fullName,
      },

      orderSummary: {
        totalItems:
          jobCard.items.length,
        estimatedOrderValue,
        totalInvoices,
        invoiceGenerated,
        totalInvoiceAmount,
        totalPaidAmount,
        totalPendingAmount,
        uninvoicedAmount,
      },

      invoices,

      items: jobCard.items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};