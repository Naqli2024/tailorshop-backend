const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");
const Invoice = require("../models/Invoice");
const generateSequence = require("../utils/generateSequence");
const Service = require("../models/Service");
const { uploadFile, deleteFile } = require("../utils/gcpStorage");

exports.bookService = async (req, res) => {
  try {
    const { customerNo, deliveryDate, notes, items } = req.body;
    const businessId = req.user.businessId;

    // VALIDATE CUSTOMER
    const customer = await Customer.findOne({
      businessId,
      customerNo,
      isDeleted: false,
    });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // VALIDATE ITEMS
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one service item required",
      });
    }

    // GENERATE NUMBER
    const currentYear = new Date().getFullYear();
    const nextNumber = await generateSequence(
      businessId,
      `JOBCARD_${currentYear}`,
    );
    const jobCardNo = `JC-${currentYear}-${String(nextNumber).padStart(5, "0")}`;
    let jobItems = [];
    let subTotal = 0;

    // PROCESS ITEMS
    for (const item of items) {
      const service = await Service.findOne({
        _id: item.serviceId,
        businessId,
        active: true,
        isDeleted: false,
      });
      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service not found" });
      }

      const quantity = item.quantity || 1;
      const total = service.price * quantity;
      subTotal += total;
      jobItems.push({
        category: service.category,
        dressType: service.serviceName,
        pieceName: service.serviceName,
        quantity,
        serviceDetails: {
          serviceId: service._id,
          serviceName: service.serviceName,
          estimatedDays: service.estimatedDays,
        },
        pricing: {
          stitchingCost: service.price,
          total,
        },
      });
    }
    // CREATE DRAFT JOB CARD
    const jobCard = await JobCard.create({
      businessId,
      jobCardNo,
      customer: customer._id,
      deliveryDate,
      notes,
      isDraft: true,
      status: "Draft",
      items: jobItems,
      billing: {
        subTotal,
        grandTotal: subTotal,
        discount: 0,
        advancePaid: 0,
        balanceAmount: subTotal,
      },
    });
    // NOTIFICATION
    await Notification.create({
      businessId,
      customer: customer._id,
      customerNo: customer.customerNo,
      title: "Draft Job Created",
      message: `Your order ${jobCardNo} has been booked successfully.`,
      type: "Job Created",
      relatedJobCard: jobCard._id,
      relatedJobCardNo: jobCardNo,
      notificationChannel: "System",
    });
    const populated = await JobCard.findById(jobCard._id).populate("customer");
    res.status(201).json({
      success: true,
      message: "Service booked successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.completeDraftJobCard = async (req, res) => {
  try {
    const { jobCardNo } = req.params;

    const { empNo, trialDate, priority, items, billing, notes } = req.body;

    const businessId = req.user.businessId;

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

    if (!jobCard.isDraft) {
      return res.status(400).json({
        success: false,
        message: "Already completed",
      });
    }

    // EMPLOYEE
    const employee = await Employee.findOne({
      businessId,
      empNo,
      isDeleted: false,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // UPDATE
    jobCard.assignedEmployee = employee._id;

    jobCard.trialDate = trialDate;

    jobCard.priority = priority;

    jobCard.items = items;

    jobCard.billing = billing;

    jobCard.notes = notes;

    jobCard.isDraft = false;

    jobCard.status = "Pending";

    jobCard.draftCompletedAt = new Date();
    await jobCard.save();

    const updated = await JobCard.findById(jobCard._id)
      .populate("customer")
      .populate("assignedEmployee");

    res.status(200).json({
      success: true,
      message: "Draft completed successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDraftJobCards = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const drafts = await JobCard.find({
      businessId,
      isDraft: true,
      isDeleted: false,
    })
      .populate("customer")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: drafts.length,
      data: drafts,
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
    const businessId = req.user.businessId;

    const jobCards = await JobCard.find({
      businessId,
      isDeleted: false,
      isDraft: false,
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

    const businessId = req.user.businessId;

    const jobCard = await JobCard.findOne({
      businessId,
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

    const businessId = req.user.businessId;

    const jobCard = await JobCard.findOne({
      businessId,
      jobCardNo,
      isDeleted: false,
      isDraft: false,
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
        businessId,
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

    jobCard.deliveryDate = deliveryDate || jobCard.deliveryDate;

    jobCard.trialDate = trialDate || jobCard.trialDate;

    jobCard.priority = priority || jobCard.priority;

    jobCard.status = status || jobCard.status;

    if (items !== undefined) {
      jobCard.items = items;
    }

    if (billing !== undefined) {
      jobCard.billing = billing;
    }

    if (notes !== undefined) {
      jobCard.notes = notes;
    }

    await jobCard.save();

    // GET CUSTOMER DETAILS
    const customer = await Customer.findOne({
      _id: jobCard.customer,
      businessId,
      isDeleted: false,
    });

    // CREATE NOTIFICATION
    await Notification.create({
      businessId,
      customer: customer._id,

      customerNo: customer.customerNo,

      title: "Job Card Updated",

      message: `Your tailoring order ${jobCard.jobCardNo} status has been updated to ${jobCard.status}.`,

      type: "Job Updated",

      relatedJobCard: jobCard._id,
      relatedJobCardNo: jobCard.jobCardNo,

      notificationChannel: "System",
    });

    // POPULATE UPDATED DATA
    const updatedJobCard = await JobCard.findById(jobCard._id)
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

    const businessId = req.user.businessId;

    const jobCard = await JobCard.findOne({
      businessId,
      jobCardNo,
      isDeleted: false,
      isDraft: false,
    });

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    const invoiceExists = await Invoice.exists({
      businessId,
      jobCard: jobCard._id,
      isDeleted: false,
    });

    if (invoiceExists) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete job card linked to invoices",
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
    const businessId = req.user.businessId;

    // CHECK CUSTOMER EXISTS
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

    // GET ALL ORDERS
    const orders = await JobCard.find({
      businessId,
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
exports.getJobCardSummary = async (req, res) => {
  try {
    const { jobCardNo } = req.params;
    const businessId = req.user.businessId;

    // FIND JOB CARD
    const jobCard = await JobCard.findOne({
      businessId,
      jobCardNo,
      isDeleted: false,
      isDraft: false,
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
      businessId,
      jobCard: jobCard._id,
      isDeleted: false,
    });

    // CALCULATIONS
    const totalInvoices = invoices.length;

    const totalInvoiceAmount = invoices.reduce(
      (sum, invoice) => sum + (invoice.ledger.totalAmount || 0),
      0,
    );

    const totalPaidAmount = invoices.reduce(
      (sum, invoice) => sum + (invoice.ledger.paidAmount || 0),
      0,
    );

    const totalPendingAmount = invoices.reduce(
      (sum, invoice) => sum + (invoice.ledger.balanceAmount || 0),
      0,
    );

    // CHECK IF INVOICE GENERATED
    const invoiceGenerated = totalInvoices > 0;

    // ESTIMATED ORDER VALUE
    const estimatedOrderValue = jobCard.billing?.grandTotal || 0;

    // IF NO INVOICE GENERATED
    const uninvoicedAmount = !invoiceGenerated
      ? estimatedOrderValue
      : Math.max(estimatedOrderValue - totalInvoiceAmount, 0);

    res.status(200).json({
      success: true,

      jobCard: {
        jobCardNo: jobCard.jobCardNo,
        status: jobCard.status,
        priority: jobCard.priority,
        deliveryDate: jobCard.deliveryDate,
        trialDate: jobCard.trialDate,
        notes: jobCard.notes,
      },

      customer: {
        customerNo: jobCard.customer.customerNo,
        fullName: jobCard.customer.fullName,
        phone: jobCard.customer.phone,
      },

      assignedEmployee: {
        empNo: jobCard.assignedEmployee?.empNo,
        fullName: jobCard.assignedEmployee?.fullName,
      },

      orderSummary: {
        totalItems: jobCard.items.length,
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

// upload fabric image
exports.uploadFabricImage = async (req, res) => {
  try {
    const { draftJobCardNo, itemId } = req.body;

    // VALIDATION
    if (!draftJobCardNo) {
      return res.status(400).json({
        success: false,
        message: "draftJobCardNo is required",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "itemId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "fabricImage file is required",
      });
    }

    // FIND DRAFT JOB CARD
    const jobCard = await JobCard.findOne({
      jobCardNo: draftJobCardNo,
      isDraft: true,
      isDeleted: false,
    });

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Draft job card not found",
      });
    }

    // FIND ITEM
    const item = jobCard.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // DELETE OLD IMAGE IF EXISTS
    if (item.fabricDetails && item.fabricDetails.fabricImagePath) {
      await deleteFile(item.fabricDetails.fabricImagePath);
    }

    // UPLOAD NEW IMAGE
    const uploaded = await uploadFile(
      req.file,
      jobCard.businessId,
      draftJobCardNo,
    );

    // INITIALIZE fabricDetails IF EMPTY
    if (!item.fabricDetails) {
      item.fabricDetails = {};
    }

    // SAVE NEW IMAGE
    item.fabricDetails.fabricImage = uploaded.fileUrl;

    item.fabricDetails.fabricImagePath = uploaded.filePath;

    await jobCard.save();

    res.status(200).json({
      success: true,
      message: "Fabric image uploaded successfully",

      data: {
        jobCardNo: draftJobCardNo,
        itemId,
        fabricImage: uploaded.fileUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateFabricImage = async (req, res) => {
  try {
    const { draftJobCardNo, itemId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "fabricImage required",
      });
    }

    // FIND JOB CARD
    const jobCard = await JobCard.findOne({
      jobCardNo: draftJobCardNo,
      isDeleted: false,
    });

    if (!jobCard) {
      return res.status(404).json({
        success: false,
        message: "Job card not found",
      });
    }

    // FIND ITEM
    const item = jobCard.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // DELETE OLD IMAGE
    if (item.fabricDetails && item.fabricDetails.fabricImagePath) {
      await deleteFile(item.fabricDetails.fabricImagePath);
    }

    // UPLOAD NEW IMAGE
    const uploaded = await uploadFile(
      req.file,
      jobCard.businessId,
      draftJobCardNo,
    );

    // SAVE NEW IMAGE
    item.fabricDetails.fabricImage = uploaded.fileUrl;

    item.fabricDetails.fabricImagePath = uploaded.filePath;

    await jobCard.save();

    res.status(200).json({
      success: true,
      message: "Fabric image updated successfully",
      fabricImage: uploaded.fileUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getJobCardSOP = async (req, res) => {
  try {
    const { jobCardNo } = req.params;
    const businessId = req.user.businessId;

    const jobCard = await JobCard.findOne({
      businessId,
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

    const sop = [
      {
        stepNo: 1,
        step: "Service Booked",
        completed: true,
        completedAt: jobCard.createdAt,
      },
      {
        stepNo: 2,
        step: "Fabric Image Uploaded",
        completed: jobCard.items.every(
          (item) => item.fabricDetails?.fabricImage,
        ),
      },
      {
        stepNo: 3,
        step: "Measurements Added",
        completed: jobCard.items.every((item) => item.measurements),
      },
      {
        stepNo: 4,
        step: "Style Details Added",
        completed: jobCard.items.every((item) => item.styleDetails?.fitType),
      },
      {
        stepNo: 5,
        step: "Employee Assigned",
        completed: !!jobCard.assignedEmployee,
      },
      {
        stepNo: 6,
        step: "Job Card Completed",
        completed: !jobCard.isDraft,
        completedAt: jobCard.draftCompletedAt,
      },
      {
        stepNo: 7,
        step: "Cutting",
        completed:
          jobCard.status === "Cutting" ||
          jobCard.status === "Stitching" ||
          jobCard.status === "Trial" ||
          jobCard.status === "Ready" ||
          jobCard.status === "Delivered",
      },
      {
        stepNo: 8,
        step: "Stitching",
        completed:
          jobCard.status === "Stitching" ||
          jobCard.status === "Trial" ||
          jobCard.status === "Ready" ||
          jobCard.status === "Delivered",
      },
      {
        stepNo: 9,
        step: "Trial",
        completed:
          jobCard.status === "Trial" ||
          jobCard.status === "Ready" ||
          jobCard.status === "Delivered",
      },
      {
        stepNo: 10,
        step: "Ready",
        completed: jobCard.status === "Ready" || jobCard.status === "Delivered",
      },
      {
        stepNo: 11,
        step: "Invoice Generated",
        completed: false,
      },
      {
        stepNo: 12,
        step: "Delivered",
        completed: jobCard.status === "Delivered",
      },
    ];

    res.status(200).json({
      success: true,
      jobCardNo,
      customer: jobCard.customer.fullName,
      currentStatus: jobCard.status,
      sop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
