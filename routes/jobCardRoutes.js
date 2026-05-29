const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  bookService,
  completeDraftJobCard,
  getDraftJobCards,
  getAllJobCards,
  getJobCardByJobCardNo,
  updateJobCard,
  deleteJobCard,
  getOrdersByCustomerNo,
  getJobCardSummary,
  uploadFabricImage
} = require("../controllers/jobCardController");
const upload = require("../middleware/upload.middleware");

// BOOK SERVICE -> CREATE DRAFT
router.post("/book-service", auth, bookService);

// COMPLETE DRAFT JOB CARD
router.put("/complete/:jobCardNo", auth, completeDraftJobCard);

// GET ALL DRAFT JOB CARDS
router.get("/drafts/all", auth, getDraftJobCards);

// GET ALL COMPLETED JOB CARDS
router.get("/all", auth, getAllJobCards);

// GET ORDERS BY CUSTOMER
router.get("/customer/:customerNo", auth, getOrdersByCustomerNo);

// JOB CARD SUMMARY
router.get("/summary/:jobCardNo", auth, getJobCardSummary);

// GET SINGLE JOB CARD
router.get("/:jobCardNo", auth, getJobCardByJobCardNo);

// UPDATE JOB CARD STATUS / DETAILS
router.put("/:jobCardNo", auth, updateJobCard);

// DELETE JOB CARD
router.delete("/:jobCardNo", auth, deleteJobCard);

router.post(
  "/upload-fabric-image",
  upload.single("fabricImage"),
  uploadFabricImage
);

module.exports = router;
