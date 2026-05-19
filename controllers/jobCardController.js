const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");

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
      assignedEmployee,
      deliveryDate,
      trialDate,
      priority,
      status,
      items,
      billing,
      notes,
    } = req.body;

    // VALIDATE EMPLOYEE
    if (assignedEmployee) {
      const employeeExists = await Employee.findOne({
        _id: assignedEmployee,
        isDeleted: false,
      });

      if (!employeeExists) {
        return res.status(404).json({
          success: false,
          message: "Assigned employee not found",
        });
      }

      jobCard.assignedEmployee = assignedEmployee;
    }

    jobCard.deliveryDate = deliveryDate || jobCard.deliveryDate;

    jobCard.trialDate = trialDate || jobCard.trialDate;

    jobCard.priority = priority || jobCard.priority;

    jobCard.status = status || jobCard.status;

    jobCard.items = items || jobCard.items;

    jobCard.billing = billing || jobCard.billing;

    jobCard.notes = notes || jobCard.notes;

    await jobCard.save();

    res.status(200).json({
      success: true,
      message: "Job card updated successfully",
      data: jobCard,
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