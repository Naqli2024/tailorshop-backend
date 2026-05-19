const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createEmployee,
  getAllEmployees,
   getEmployeeByEmpNo,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

// CREATE EMPLOYEE
router.post("/add", auth, createEmployee);

// GET ALL EMPLOYEES
router.get("/all", auth, getAllEmployees);

// GET EMPLOYEE BY EMP NO
router.get("/:empNo", auth, getEmployeeByEmpNo);

// UPDATE EMPLOYEE
router.put("/:empNo", auth, updateEmployee);

// DELETE EMPLOYEE
router.delete("/:empNo", auth, deleteEmployee);

module.exports = router;