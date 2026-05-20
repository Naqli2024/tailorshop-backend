const express = require("express");
const router = express.Router();
const {
  getNotificationsByCustomerNo,
} = require(
  "../controllers/notificationController"
);
const auth = require("../middleware/auth.middleware");


// GET NOTIFICATIONS BY CUSTOMER NO
router.get("/customer/:customerNo", auth, getNotificationsByCustomerNo);


module.exports = router;