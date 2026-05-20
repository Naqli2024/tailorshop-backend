const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceByInvoiceNo,
  receivePayment,
} = require("../controllers/invoiceController");
const auth = require("../middleware/auth.middleware");


// CREATE INVOICE
router.post("/create", auth, createInvoice);

// RECEIVE PAYMENT
router.post("/receive-payment/:invoiceNo", receivePayment);

// GET ALL INVOICES
router.get("/all", auth, getAllInvoices);

// GET INVOICE BY NO
router.get("/:invoiceNo", getInvoiceByInvoiceNo);

module.exports = router;