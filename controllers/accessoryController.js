const Accessory = require("../models/Accessory");
const generateSequence = require("../utils/generateSequence");

exports.createAccessory = async (req, res) => {
  try {
    const {
      itemName,
      category,
      quantity,
      unit,
      reorderLevel,
      costPerUnit,
      supplier,
    } = req.body;

    // CHECK DUPLICATE
    const existing = await Accessory.findOne({
      businessId: req.user.businessId,
      itemName,
      category,
      isDeleted: false,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Accessory already exists",
      });
    }

    // GENERATE ACCESSORY NUMBER
    const count = await Accessory.countDocuments({
      businessId: req.user.businessId,
    });

    const accessoryNo = `ACC-${String(count + 1).padStart(5, "0")}`;

    // STATUS
    let status = "In Stock";

    if (quantity <= 0) {
      status = "Out Of Stock";
    } else if (quantity <= reorderLevel) {
      status = "Low Stock";
    }

    // CREATE
    const accessory = await Accessory.create({
      businessId: req.user.businessId,
      accessoryNo,
      itemName,
      category,
      quantity,
      unit,
      reorderLevel,
      costPerUnit,
      supplier,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Accessory added successfully",
      data: accessory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.restockAccessory = async (req, res) => {
  try {
    const { accessoryNo } = req.params;

    const { quantity } = req.body;

    const accessory = await Accessory.findOne({
      businessId: req.user.businessId,
      accessoryNo,
      isDeleted: false,
    });

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: "Accessory not found",
      });
    }

    accessory.quantity += Number(quantity);

    // STATUS
    if (accessory.quantity <= 0) {
      accessory.status = "Out of Stock";
    } else if (accessory.quantity <= accessory.reorderAt) {
      accessory.status = "Low Stock";
    } else {
      accessory.status = "In Stock";
    }

    await accessory.save();

    res.status(200).json({
      success: true,
      message: "Accessory restocked successfully",
      data: accessory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find({
      businessId: req.user.businessId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: accessories.length,
      data: accessories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAccessoriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const accessories = await Accessory.find({
      businessId: req.user.businessId,
      category: {
        $regex: new RegExp(`^${category}$`, "i"),
      },
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      total: accessories.length,
      data: accessories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAccessory = async (req, res) => {
  try {
    const { accessoryNo } = req.params;

    const accessory = await Accessory.findOne({
      businessId: req.user.businessId,
      accessoryNo,
    });

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: "Accessory not found",
      });
    }

    accessory.isDeleted = true;

    await accessory.save();

    res.status(200).json({
      success: true,
      message: "Accessory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAccessoriesDashboard = async (req, res) => {
  try {
    const accessories = await Accessory.find({
      businessId: req.user.businessId,
      isDeleted: false,
    });

    const totalSkus = accessories.length;

    const lowStock = accessories.filter((a) => a.status === "Low Stock").length;

    const outOfStock = accessories.filter(
      (a) => a.status === "Out of Stock",
    ).length;

    const stockValue = accessories.reduce(
      (sum, item) => sum + item.quantity * item.costPerUnit,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalSkus,
        lowStock,
        outOfStock,
        stockValue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
