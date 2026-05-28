const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// CREATE
router.post("/create", auth, createService);

// GET ALL
router.get("/all", auth, getAllServices);

// GET SINGLE
router.get("/:id", auth, getServiceById);

// UPDATE
router.put("/:id", auth, updateService);

// DELETE
router.delete("/:id", auth, deleteService);

module.exports = router;
