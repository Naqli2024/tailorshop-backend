const express = require("express");
const router = express.Router();
const {
  getSalesOverview,
  getRevenueByDressType,
  getEmployeePerformance,
  getPendingCollections,
  getCustomerInsights,
} = require("../controllers/dashboardController");
const auth = require("../middleware/auth.middleware");

// SALES OVERVIEW
router.get("/sales-overview", auth, getSalesOverview);

// REVENUE BY DRESS TYPE
router.get("/revenue-by-dress-type", auth, getRevenueByDressType);

// EMPLOYEE PERFORMANCE
router.get("/employee-performance", auth, getEmployeePerformance);

// PENDING COLLECTIONS
router.get("/pending-collections", auth, getPendingCollections);

// CUSTOMER INSIGHTS
router.get("/customer-insights", auth, getCustomerInsights);

module.exports = router;
