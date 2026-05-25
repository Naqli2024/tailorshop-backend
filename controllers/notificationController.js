const Notification = require("../models/Notification");
const Customer = require("../models/Customer");

// GET NOTIFICATIONS BY CUSTOMER NO
exports.getNotificationsByCustomerNo = async (req, res) => {
  try {
    const { customerNo } = req.params;

    // CHECK CUSTOMER EXISTS
    const businessId = req.user.businessId;

    const customer = await Customer.findOne({
      businessId,
      customerNo,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // GET NOTIFICATIONS
    const notifications = await Notification.find({
      businessId,
      customer: customer._id,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,

      customer: {
        customerNo: customer.customerNo,
        fullName: customer.fullName,
        phone: customer.phone,
      },

      totalNotifications: notifications.length,
      unreadCount,

      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
