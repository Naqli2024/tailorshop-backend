const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceByInvoiceNo,
  getPublicInvoice,
  receivePayment,
} = require("../controllers/invoiceController");
const auth = require("../middleware/auth.middleware");

// CREATE INVOICE
router.post("/create", auth, createInvoice);

// RECEIVE PAYMENT
router.post("/receive-payment/:invoiceNo", auth, receivePayment);

// GET ALL INVOICES
router.get("/all", auth, getAllInvoices);

// Public API
router.get("/public/:shopCode/:invoiceNo", getPublicInvoice);

// GET INVOICE BY NO
router.get("/:invoiceNo", auth, getInvoiceByInvoiceNo);


module.exports = router;
