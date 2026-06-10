const Customer = require("../models/Customer");
const generateSequence = require("../utils/generateSequence");

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const { fullName, phone, email, address, customerSegment, measurements } = req.body;

    const existingCustomer = await Customer.findOne({
      businessId,
      phone,
      isDeleted: false,
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists with this phone number",
      });
    }

    const nextNumber = await generateSequence(businessId, "CUSTOMER");

    const customerNo = `CUS${String(nextNumber).padStart(4, "0")}`;

    const customer = await Customer.create({
      businessId,
      customerNo,
      fullName,
      phone,
      email,
      address,
      customerSegment,
      measurements,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL CUSTOMERS
exports.getAllCustomers = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const customers = await Customer.find({
      businessId,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CUSTOMER BY CUSTOMER NO
exports.getCustomerByCustomerNo = async (req, res) => {
  try {
    const { customerNo } = req.params;

    const businessId = req.user.businessId;

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

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const { customerNo } = req.params;

    const { fullName, phone, email, address, customerSegment } = req.body;

    // CHECK CUSTOMER EXISTS
    const businessId = req.user.businessId;

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

    // CHECK DUPLICATE PHONE
    if (phone) {
      const duplicatePhone = await Customer.findOne({
        businessId,
        phone,
        _id: { $ne: customer._id },
        isDeleted: false,
      });

      if (duplicatePhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already used by another customer",
        });
      }
    }

    customer.fullName = fullName || customer.fullName;
    customer.phone = phone || customer.phone;
    customer.email = email || customer.email;
    customer.address = address || customer.address;
    customer.customerSegment = customerSegment || customer.customerSegment;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CUSTOMER (SOFT DELETE)
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerNo } = req.params;

    const businessId = req.user.businessId;

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

    customer.isDeleted = true;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
