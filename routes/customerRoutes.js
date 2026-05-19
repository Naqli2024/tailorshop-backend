const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createCustomer,
  getAllCustomers,
  getCustomerByCustomerNo,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");


// CREATE CUSTOMER
router.post("/add", auth, createCustomer);

// GET ALL CUSTOMERS
router.get("/all", auth, getAllCustomers);

// GET CUSTOMER BY CUSTOMER NO
router.get("/:customerNo", auth, getCustomerByCustomerNo);

// UPDATE CUSTOMER
router.put("/:customerNo", auth, updateCustomer);

// DELETE CUSTOMER
router.delete("/:customerNo", auth, deleteCustomer);

module.exports = router;