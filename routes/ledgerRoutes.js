const express = require("express");
const router = express.Router();
const {
  getCustomerLedger,
} = require("../controllers/ledgerController");
const auth = require("../middleware/auth.middleware");


// GET CUSTOMER LEDGER
router.get("/customer/:customerNo", auth, getCustomerLedger);

module.exports = router;