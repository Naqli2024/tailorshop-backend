const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createAccessory,
  getAllAccessories,
  getAccessoriesByCategory,
  restockAccessory,
  deleteAccessory,
  getAccessoriesDashboard,
} = require("../controllers/accessoryController");

// CREATE
router.post("/add", auth, createAccessory);

// GET ALL
router.get("/get-all", auth, getAllAccessories);

// DASHBOARD
router.get("/dashboard", auth, getAccessoriesDashboard);

// CATEGORY
router.get("/category/:category", auth, getAccessoriesByCategory);

// RESTOCK
router.put("/restock/:accessoryNo", auth, restockAccessory);

// DELETE
router.delete("/:accessoryNo", auth, deleteAccessory);

module.exports = router;