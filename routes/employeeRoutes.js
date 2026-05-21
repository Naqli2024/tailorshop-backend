const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createEmployee,
  getAllEmployees,
  getEmployeeByEmpNo,
  updateEmployee,
  deleteEmployee,
  getEmployeeWorkloads,
  getEmployeeWorkloadByEmpNo,
} = require("../controllers/employeeController");

// CREATE EMPLOYEE
router.post("/add", auth, createEmployee);

// GET ALL EMPLOYEES
router.get("/all", auth, getAllEmployees);

// GET ALL EMPLOYEE WORKLOADS
router.get("/workload", auth, getEmployeeWorkloads);

// Single Employee Workload
router.get("/workload/:empNo", auth, getEmployeeWorkloadByEmpNo);

// GET EMPLOYEE BY EMP NO
router.get("/:empNo", auth, getEmployeeByEmpNo);

// UPDATE EMPLOYEE
router.put("/:empNo", auth, updateEmployee);

// DELETE EMPLOYEE
router.delete("/:empNo", auth, deleteEmployee);


module.exports = router;
