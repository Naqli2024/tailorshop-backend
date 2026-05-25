const mongoose = require("mongoose");
const FabricRoll = require("../models/FabricRoll");
const FabricUsage = require("../models/FabricUsage");

exports.createFabricRoll = async (req, res) => {
  try {
    const {
      fabricName,
      fabricType,
      color,
      pattern,
      totalMeters,
      costPerMeter,
      supplier,
      location,
      reorderLevel,
      notes,
    } = req.body;
    const businessId = req.user.businessId;

    const nextNumber = await generateSequence(businessId, "FABRIC_ROLL");

    const rollNo = `FR-${String(nextNumber).padStart(4, "0")}`;

    const roll = await FabricRoll.create({
      businessId,
      rollNo,
      fabricName,
      fabricType,
      color,
      pattern,
      totalMeters,
      remainingMeters: totalMeters,
      costPerMeter,
      supplier,
      location,
      reorderLevel,
      notes,
    });

    res.status(201).json({
      success: true,
      data: roll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Fabric Rolls
exports.getAllFabricRolls = async (req, res) => {
  try {
    const rolls = await FabricRoll.find({
      businessId: req.user.businessId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: rolls.length,
      data: rolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Fabric Roll By Roll No
exports.getFabricRollByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const roll = await FabricRoll.findOne({
      businessId: req.user.businessId,
      rollNo,
      isDeleted: false,
    });

    if (!roll) {
      return res.status(404).json({
        success: false,
        message: "Fabric roll not found",
      });
    }

    res.status(200).json({
      success: true,
      data: roll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Fabric Roll
exports.updateFabricRoll = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const roll = await FabricRoll.findOne({
      businessId: req.user.businessId,
      rollNo,
      isDeleted: false,
    });

    if (!roll) {
      return res.status(404).json({
        success: false,
        message: "Fabric roll not found",
      });
    }

    const {
      fabricName,
      fabricType,
      color,
      pattern,
      costPerMeter,
      supplier,
      location,
      reorderLevel,
      notes,
    } = req.body;

    roll.fabricName = fabricName || roll.fabricName;

    roll.fabricType = fabricType || roll.fabricType;

    roll.color = color || roll.color;

    roll.pattern = pattern || roll.pattern;

    roll.costPerMeter = costPerMeter ?? roll.costPerMeter;

    roll.supplier = supplier || roll.supplier;

    roll.location = location || roll.location;

    roll.reorderLevel = reorderLevel ?? roll.reorderLevel;

    roll.notes = notes || roll.notes;

    await roll.save();

    res.status(200).json({
      success: true,
      message: "Fabric roll updated successfully",
      data: roll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Fabric Roll
exports.deleteFabricRoll = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const roll = await FabricRoll.findOne({
      businessId: req.user.businessId,
      rollNo,
      isDeleted: false,
    });

    if (!roll) {
      return res.status(404).json({
        success: false,
        message: "Fabric roll not found",
      });
    }

    roll.isDeleted = true;

    await roll.save();

    res.status(200).json({
      success: true,
      message: "Fabric roll deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Default Fabric API
exports.deductFabric = async (req, res) => {
  try {
    const { rollNo, usedMeters, jobCardNo, reason } = req.body;

    const roll = await FabricRoll.findOne({
      businessId: req.user.businessId,
      rollNo,
      isDeleted: false,
    });

    if (!roll) {
      return res.status(404).json({
        success: false,
        message: "Fabric roll not found",
      });
    }

    if (usedMeters > roll.remainingMeters) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    roll.remainingMeters -= usedMeters;

    const percentage = (roll.remainingMeters / roll.totalMeters) * 100;

    if (percentage <= 20) {
      roll.status = "Empty";
    } else if (percentage <= 70) {
      roll.status = "Partial";
    } else {
      roll.status = "Full";
    }

    await roll.save();

    const nextNumber = await generateSequence(
      req.user.businessId,
      "FABRIC_USAGE",
    );

    const transactionNo = `FUT-${String(nextNumber).padStart(5, "0")}`;

    await FabricUsage.create({
      businessId: req.user.businessId,
      transactionNo,

      fabricRoll: roll._id,

      rollNo,

      jobCardNo,

      usedMeters,

      remainingMeters: roll.remainingMeters,

      reason,
    });

    res.status(200).json({
      success: true,
      message: "Fabric deducted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Fabric Usage History
exports.getFabricUsageHistory = async (req, res) => {
  try {
    const history = await FabricUsage.find({
      businessId: req.user.businessId,
    })
      .populate("fabricRoll", "fabricName fabricType color")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fabric Dashboard
exports.getFabricDashboard = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const rolls = await FabricRoll.find({
      businessId,
      isDeleted: false,
    });

    const usages = await FabricUsage.find({
      businessId,
    });

    // TOTAL ROLLS
    const totalRolls = rolls.length;

    // TOTAL METERS
    const totalMeters = rolls.reduce(
      (sum, roll) => sum + roll.remainingMeters,
      0,
    );

    // STOCK VALUE
    const stockValue = rolls.reduce(
      (sum, roll) => sum + roll.remainingMeters * roll.costPerMeter,
      0,
    );

    // LOW STOCK
    const lowStockRolls = rolls.filter(
      (roll) => roll.remainingMeters <= roll.reorderLevel,
    ).length;

    // TODAY CONSUMPTION
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const todayConsumption = usages
      .filter((usage) => usage.createdAt >= startOfToday)
      .reduce((sum, usage) => sum + usage.usedMeters, 0);

    // MONTH CONSUMPTION
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyConsumption = usages
      .filter((usage) => usage.createdAt >= startOfMonth)
      .reduce((sum, usage) => sum + usage.usedMeters, 0);

    // MOST USED FABRIC
    const usageMap = {};

    usages.forEach((usage) => {
      if (!usageMap[usage.rollNo]) {
        usageMap[usage.rollNo] = 0;
      }

      usageMap[usage.rollNo] += usage.usedMeters;
    });

    let mostUsedRollNo = null;

    let maxUsed = 0;

    Object.keys(usageMap).forEach((rollNo) => {
      if (usageMap[rollNo] > maxUsed) {
        maxUsed = usageMap[rollNo];

        mostUsedRollNo = rollNo;
      }
    });

    let mostUsedFabric = null;

    if (mostUsedRollNo) {
      const roll = await FabricRoll.findOne({
        businessId,
        rollNo: mostUsedRollNo,
      });

      mostUsedFabric = {
        rollNo: mostUsedRollNo,

        fabricName: roll?.fabricName,

        usedMeters: maxUsed,
      };
    }

    res.status(200).json({
      success: true,

      data: {
        totalRolls,

        totalMeters,

        stockValue,

        lowStockRolls,

        todayConsumption,

        monthlyConsumption,

        mostUsedFabric,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Low stock alert API
exports.getLowStockRolls = async (req, res) => {
  try {
    const rolls = await FabricRoll.find({
      businessId: req.user.businessId,
      isDeleted: false,
    });

    const lowStock = rolls.filter(
      (roll) => roll.remainingMeters <= roll.reorderLevel,
    );

    res.status(200).json({
      success: true,

      total: lowStock.length,

      data: lowStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Consumption Report
exports.getConsumptionReport = async (req, res) => {
  try {
    const report = await FabricUsage.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(req.user.businessId),
        },
      },
      {
        $group: {
          _id: "$rollNo",

          totalUsedMeters: {
            $sum: "$usedMeters",
          },

          totalTransactions: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalUsedMeters: -1,
        },
      },
    ]);

    const finalReport = await Promise.all(
      report.map(async (item) => {
        const fabric = await FabricRoll.findOne({
          businessId: req.user.businessId,
          rollNo: item._id,
        });

        return {
          rollNo: item._id,

          fabricName: fabric?.fabricName,

          fabricType: fabric?.fabricType,

          totalUsedMeters: item.totalUsedMeters,

          totalTransactions: item.totalTransactions,
        };
      }),
    );

    res.status(200).json({
      success: true,
      total: finalReport.length,
      data: finalReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getUsageByJobCard
exports.getUsageByJobCard = async (req, res) => {
  try {
    const report = await FabricUsage.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(req.user.businessId),
        },
      },
      {
        $group: {
          _id: "$jobCardNo",

          totalUsedMeters: {
            $sum: "$usedMeters",
          },

          totalTransactions: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalUsedMeters: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      total: report.length,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Stock Value Report
exports.getStockValueReport = async (req, res) => {
  try {
    const rolls = await FabricRoll.find({
      businessId: req.user.businessId,
      isDeleted: false,
    });

    const report = rolls.map((roll) => ({
      rollNo: roll.rollNo,

      fabricName: roll.fabricName,

      remainingMeters: roll.remainingMeters,

      costPerMeter: roll.costPerMeter,

      stockValue: roll.remainingMeters * roll.costPerMeter,
    }));

    const totalStockValue = report.reduce(
      (sum, item) => sum + item.stockValue,
      0,
    );

    res.status(200).json({
      success: true,

      totalStockValue,

      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Stock Movement History
exports.getMovementHistory = async (req, res) => {
  try {
    const history = await FabricUsage.find({
      businessId: req.user.businessId,
    })
      .populate("fabricRoll", "fabricName fabricType color")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      total: history.length,

      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
