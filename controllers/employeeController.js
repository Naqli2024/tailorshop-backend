const Employee = require("../models/Employee");
const JobCard = require("../models/JobCard");

const garmentPoints = require(
  "../utils/workloadPoints"
);


// CREATE EMPLOYEE
exports.createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      role,
      phone,
      email,
      address,
      joinedDate,
      salaryPerMonth,
      status,
      skills,
      notes,
    } = req.body;

    // CHECK DUPLICATE PHONE
    const existingEmployee = await Employee.findOne({
      phone,
      isDeleted: false,
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists with this phone number",
      });
    }

    // GENERATE EMPLOYEE NUMBER
    const employeeCount = await Employee.countDocuments();

    const empNo = `EMP${String(employeeCount + 1).padStart(4, "0")}`;

    // CREATE EMPLOYEE
    const employee = await Employee.create({
      empNo,
      fullName,
      role,
      phone,
      email,
      address,
      joinedDate,
      salaryPerMonth,
      status,
      skills,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET EMPLOYEE BY EMP NO
exports.getEmployeeByEmpNo = async (req, res) => {
  try {
    const { empNo } = req.params;

    const employee = await Employee.findOne({
      empNo,
      isDeleted: false,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  try {
    const { empNo } = req.params;

    const {
      fullName,
      role,
      phone,
      email,
      address,
      joinedDate,
      salaryPerMonth,
      status,
      skills,
      notes,
    } = req.body;

    // CHECK EMPLOYEE EXISTS
    const employee = await Employee.findOne({
      empNo,
      isDeleted: false,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // CHECK DUPLICATE PHONE
    if (phone) {
      const duplicatePhone = await Employee.findOne({
        phone,
        _id: { $ne: employee._id },
        isDeleted: false,
      });

      if (duplicatePhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already used by another employee",
        });
      }
    }

    employee.fullName = fullName || employee.fullName;
    employee.role = role || employee.role;
    employee.phone = phone || employee.phone;
    employee.email = email || employee.email;
    employee.address = address || employee.address;
    employee.joinedDate = joinedDate || employee.joinedDate;
    employee.salaryPerMonth =
      salaryPerMonth || employee.salaryPerMonth;

    employee.status = status || employee.status;

    employee.skills = skills || employee.skills;

    employee.notes = notes || employee.notes;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE EMPLOYEE 
exports.deleteEmployee = async (req, res) => {
  try {
    const { empNo } = req.params;

    const employee = await Employee.findOne({
      empNo,
      isDeleted: false,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.isDeleted = true;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL EMPLOYEE WORKLOADS
exports.getEmployeeWorkloads =
  async (req, res) => {
    try {
      const employees =
        await Employee.find({
          isDeleted: false,
        });

      const result = [];

      for (const emp of employees) {
        const activeJobs =
          await JobCard.find({
            assignedEmployee: emp._id,

            status: {
              $in: [
                "Pending",
                "Assigned",
                "Cutting",
                "Stitching",
                "Trial Pending",
                "In Progress",
              ],
            },

            isDeleted: false,
          });

        let assignedPoints = 0;

        activeJobs.forEach((job) => {
          job.items.forEach((item) => {
            assignedPoints +=
              garmentPoints[
                item.dressType
              ] || 1;
          });
        });

        const capacity =
          emp.dailyCapacityPoints || 10;

        const workloadPercentage =
          Math.round(
            (assignedPoints /
              capacity) *
              100
          );

        let workloadStatus =
          "Available";

        if (
          workloadPercentage > 50 &&
          workloadPercentage <= 80
        ) {
          workloadStatus = "Busy";
        }

        if (
          workloadPercentage > 80
        ) {
          workloadStatus =
            "Overloaded";
        }

        result.push({
          empNo: emp.empNo,

          fullName:
            emp.fullName,

          role: emp.role,

          skills:
            emp.skills,

          capacity,

          assignedPoints,

          workloadPercentage,

          workloadStatus,

          activeOrders:
            activeJobs.length,
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


  // Single Employee Workload
  exports.getEmployeeWorkloadByEmpNo =
  async (req, res) => {
    try {
      const { empNo } =
        req.params;

      const employee =
        await Employee.findOne({
          empNo,
          isDeleted: false,
        });

      if (!employee) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Employee not found",
          });
      }

      const activeJobs =
        await JobCard.find({
          assignedEmployee:
            employee._id,

          status: {
            $in: [
              "Pending",
              "Assigned",
              "Cutting",
              "Stitching",
              "Trial Pending",
              "In Progress",
            ],
          },

          isDeleted: false,
        });

      let assignedPoints = 0;

      activeJobs.forEach((job) => {
        job.items.forEach((item) => {
          assignedPoints +=
            garmentPoints[
              item.dressType
            ] || 1;
        });
      });

      const capacity =
        employee.dailyCapacityPoints ||
        10;

      const workloadPercentage =
        Math.round(
          (assignedPoints /
            capacity) *
            100
        );

      let workloadStatus =
        "Available";

      if (
        workloadPercentage > 50 &&
        workloadPercentage <= 80
      ) {
        workloadStatus = "Busy";
      }

      if (
        workloadPercentage > 80
      ) {
        workloadStatus =
          "Overloaded";
      }

      res.status(200).json({
        success: true,

        data: {
          empNo:
            employee.empNo,

          fullName:
            employee.fullName,

          assignedPoints,

          capacity,

          workloadPercentage,

          workloadStatus,

          activeOrders:
            activeJobs.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };