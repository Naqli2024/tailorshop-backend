const express = require("express");
const router = express.Router();
const {
  createFabricRoll,
  getAllFabricRolls,
  getFabricRollByRollNo,
  getFabricDashboard,
  getConsumptionReport,
  getLowStockRolls,
  getUsageByJobCard,
  getStockValueReport,
  getMovementHistory,
  updateFabricRoll,
  deleteFabricRoll,
  deductFabric,
  getFabricUsageHistory,
} = require("../controllers/fabricRollController");
const auth = require("../middleware/auth.middleware");

// CREATE FABRIC ROLL
router.post("/", auth, createFabricRoll);

// Get Fabric Usage History
router.get("/usage-history", auth, getFabricUsageHistory);

// USE / DEDUCT FABRIC
router.post("/deduct", auth, deductFabric);

// Get All Fabric Rolls
router.get("/", auth, getAllFabricRolls);

// Get Fabric Dashboard
router.get("/dashboard", auth, getFabricDashboard);

// Low stock API alert
router.get("/low-stock", auth, getLowStockRolls);

// Consumption Report
router.get("/consumption-report", auth, getConsumptionReport);

// getUsageByJobCard
router.get("/usage-by-jobcard", auth, getUsageByJobCard);

// Stock Value Report
router.get("/stock-value-report", auth, getStockValueReport);

// Movement History
router.get("/movement-history", auth, getMovementHistory);

// Get Fabric Roll By Roll No
router.get("/:rollNo", auth, getFabricRollByRollNo);

// Update Fabric Roll
router.put("/:rollNo", auth, updateFabricRoll);

// Delete Fabric Roll
router.delete("/:rollNo", auth, deleteFabricRoll);

module.exports = router;
