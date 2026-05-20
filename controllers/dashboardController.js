const Invoice = require("../models/Invoice");
const JobCard = require("../models/JobCard");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");



// SALES OVERVIEW
exports.getSalesOverview = async (
  req,
  res
) => {
  try {
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const startOfYear = new Date(
      today.getFullYear(),
      0,
      1
    );

    // TODAY SALES
    const todayInvoices = await Invoice.find({
      createdAt: {
        $gte: startOfToday,
      },
      isDeleted: false,
    });

    // MONTH SALES
    const monthlyInvoices =
      await Invoice.find({
        createdAt: {
          $gte: startOfMonth,
        },
        isDeleted: false,
      });

    // YEAR SALES
    const yearlyInvoices =
      await Invoice.find({
        createdAt: {
          $gte: startOfYear,
        },
        isDeleted: false,
      });

    const todaySales =
      todayInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.ledger.totalAmount || 0),
        0
      );

    const monthlySales =
      monthlyInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.ledger.totalAmount || 0),
        0
      );

    const yearlySales =
      yearlyInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.ledger.totalAmount || 0),
        0
      );

    const pendingCollections =
      yearlyInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.ledger.balanceAmount || 0),
        0
      );

    const todayPaymentsReceived =
      todayInvoices.reduce(
        (sum, inv) =>
          sum +
          (inv.ledger.paidAmount || 0),
        0
      );

    const totalOrders =
      await JobCard.countDocuments({
        isDeleted: false,
      });

    res.status(200).json({
      success: true,

      data: {
        todaySales,

        monthlySales,

        yearlySales,

        todayPaymentsReceived,

        pendingCollections,

        totalInvoices:
          yearlyInvoices.length,

        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// REVENUE BY DRESS TYPE
exports.getRevenueByDressType = async (
  req,
  res
) => {
  try {
    const jobCards = await JobCard.find({
      isDeleted: false,
    });

    const revenueMap = {};

    jobCards.forEach((job) => {
      job.items.forEach((item) => {
        const type = item.dressType;

        if (!revenueMap[type]) {
          revenueMap[type] = {
            dressType: type,
            orders: 0,
            revenue: 0,
          };
        }

        revenueMap[type].orders += 1;

        revenueMap[type].revenue +=
          item.pricing?.total || 0;
      });
    });

    const result =
      Object.values(revenueMap);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// EMPLOYEE PERFORMANCE
exports.getEmployeePerformance =
  async (req, res) => {
    try {
      const employees =
        await Employee.find({
          isDeleted: false,
        });

      const result = [];

      for (const emp of employees) {
        const jobs =
          await JobCard.find({
            assignedEmployee: emp._id,
            isDeleted: false,
          });

        let revenueGenerated = 0;

        jobs.forEach((job) => {
          revenueGenerated +=
            job.billing?.grandTotal || 0;
        });

        result.push({
          empNo: emp.empNo,

          fullName: emp.fullName,

          ordersHandled:
            jobs.length,

          revenueGenerated,
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };



// PENDING COLLECTIONS
exports.getPendingCollections =
  async (req, res) => {
    try {
      const invoices =
        await Invoice.find({
          isDeleted: false,
        }).populate("customer");

      const pendingInvoices =
        invoices.filter(
          (inv) =>
            inv.ledger.balanceAmount > 0
        );

      const totalPendingAmount =
        pendingInvoices.reduce(
          (sum, inv) =>
            sum +
            inv.ledger.balanceAmount,
          0
        );

      res.status(200).json({
        success: true,

        totalPendingInvoices:
          pendingInvoices.length,

        totalPendingAmount,

        data: pendingInvoices.map(
          (inv) => ({
            invoiceNo:
              inv.invoiceNo,

            customerNo:
              inv.customer
                ?.customerNo,

            customerName:
              inv.customer
                ?.fullName,

            totalAmount:
              inv.ledger
                ?.totalAmount,

            paidAmount:
              inv.ledger
                ?.paidAmount,

            balanceAmount:
              inv.ledger
                ?.balanceAmount,

            paymentStatus:
              inv.ledger
                ?.paymentStatus,
          })
        ),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };



// CUSTOMER INSIGHTS
exports.getCustomerInsights =
  async (req, res) => {
    try {
      const customers =
        await Customer.find({
          isDeleted: false,
        });

      const invoices =
        await Invoice.find({
          isDeleted: false,
        });

      let vipCustomers = 0;
      let regularCustomers = 0;
      let newCustomers = 0;

      customers.forEach((cust) => {
        if (
          cust.classificationSegment ===
          "VIP"
        ) {
          vipCustomers++;
        } else if (
          cust.classificationSegment ===
          "Regular"
        ) {
          regularCustomers++;
        } else {
          newCustomers++;
        }
      });

      const spendingMap = {};

      invoices.forEach((inv) => {
        const custId =
          inv.customer.toString();

        if (!spendingMap[custId]) {
          spendingMap[custId] = 0;
        }

        spendingMap[custId] +=
          inv.ledger.totalAmount || 0;
      });

      const topCustomers =
        customers
          .map((cust) => ({
            customerNo:
              cust.customerNo,

            fullName:
              cust.fullName,

            totalSpent:
              spendingMap[
                cust._id.toString()
              ] || 0,
          }))
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent
          )
          .slice(0, 5);

      res.status(200).json({
        success: true,

        data: {
          totalCustomers:
            customers.length,

          vipCustomers,

          regularCustomers,

          newCustomers,

          topCustomers,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };