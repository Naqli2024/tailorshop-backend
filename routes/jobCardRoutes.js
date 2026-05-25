const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createJobCard,
  getAllJobCards,
  getJobCardByJobCardNo,
  updateJobCard,
  deleteJobCard,
  getOrdersByCustomerNo,
  getJobCardSummary,
} = require("../controllers/jobCardController");

// CREATE JOB CARD
router.post("/create", auth, createJobCard);

// GET ALL JOB CARDS
router.get("/all", auth, getAllJobCards);

// GET ORDERS BY CUSTOMER NO
router.get("/customer/:customerNo", auth, getOrdersByCustomerNo);

// JOB CARD SUMMARY
router.get("/summary/:jobCardNo", auth, getJobCardSummary);

// GET JOB CARD BY NO
router.get("/:jobCardNo", auth, getJobCardByJobCardNo);

// UPDATE JOB CARD
router.put("/:jobCardNo", auth, updateJobCard);

// DELETE JOB CARD
router.delete("/:jobCardNo", auth, deleteJobCard);

module.exports = router;
