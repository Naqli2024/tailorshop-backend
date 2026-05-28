const Service = require("../models/Service");
const generateSequence = require("../utils/generateSequence");

// CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const { serviceName, category, price, estimatedDays } = req.body;
    const businessId = req.user.businessId;
    const nextNumber = await generateSequence(businessId, "SERVICE");
    const serviceCode = `SER-${String(nextNumber).padStart(4, "0")}`;
    const service = await Service.create({
      businessId,
      serviceCode,
      serviceName,
      category,
      price,
      estimatedDays,
    });
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL SERVICES
exports.getAllServices = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const services = await Service.find({ businessId, isDeleted: false }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, total: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SERVICE BY ID
exports.getServiceById = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const service = await Service.findOne({
      _id: req.params.id,
      businessId,
      isDeleted: false,
    });
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const service = await Service.findOne({
      _id: req.params.id,
      businessId,
      isDeleted: false,
    });
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    const { serviceName, category, price, estimatedDays, active } = req.body;
    service.serviceName = serviceName || service.serviceName;
    service.category = category || service.category;
    service.price = price || service.price;
    service.estimatedDays = estimatedDays || service.estimatedDays;
    if (active !== undefined) {
      service.active = active;
    }
    await service.save();
    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const service = await Service.findOne({
      _id: req.params.id,
      businessId,
      isDeleted: false,
    });
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    service.isDeleted = true;
    await service.save();
    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
