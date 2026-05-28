const crypto = require("crypto");

if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}

// environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const business = require("./routes/business.routes");
const auth = require("./routes/auth.routes");
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const jobCardRoutes = require("./routes/jobCardRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const fabricRollRoutes = require("./routes/fabricRollRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

// CORS Configuration
app.use(cors());

// Serve Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API
app.use("/api/business", business);
app.use("/api/auth", auth);
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/jobcards", jobCardRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/fabric-rolls", fabricRollRoutes);
app.use( "/api/services", serviceRoutes );

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
