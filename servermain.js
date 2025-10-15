require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const colors = require("colors");
const mongoose = require("mongoose");

// ===== Custom Modules =====
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const sanitizeInput = require("./middleware/sanitizeInput");

// ===== Route Files =====
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const propertyRoutes = require("./routes/propertyRoutes");
const zoneSubAreaRoutes = require("./routes/zoneSubAreaRoutes");
const propertyTypeRoutes = require("./routes/propertyTypeRoutes");
const availabilityStatusRoutes = require("./routes/availabilityStatusRoutes");
const unitRoutes = require("./routes/unitRoutes");
const furnishingRoutes = require("./routes/furnishingRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const petPolicyRoutes = require("./routes/petPolicyRoutes");
const createPropertyRoutes = require("./routes/createPropertyRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const depositRoutes = require("./routes/depositRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const staffRoutes = require("./routes/staffRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

// ===== Connect to MongoDB =====
connectDB();

// ===== Initialize App =====
const app = express();

/* =========================================================
   ⚙️ Middleware Order
========================================================= */
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: false,
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:9002",
  "https://183-housingsolutions.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Security & Parsers
app.use(
  helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false })
);
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(cookieParser());
app.use(sanitizeInput);
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(hpp());

// ✅ Rate Limiter
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 500,
    message: {
      success: false,
      error: "Too many requests, please try again later.",
    },
  })
);

/* =========================================================
   ⚠️ Static Upload Folder (Disabled on Vercel)
========================================================= */
// app.use(
//   "/uploads",
//   (req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Cross-Origin-Resource-Policy", "cross-origin");
//     next();
//   },
//   express.static(path.join(__dirname, "uploads"))
// );

/* =========================================================
   🛠️ Routes
========================================================= */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/property", propertyRoutes);
app.use("/api/v1/zonesubarea", zoneSubAreaRoutes);
app.use("/api/v1/propertytype", propertyTypeRoutes);
app.use("/api/v1/availabilitystatus", availabilityStatusRoutes);
app.use("/api/v1/unit", unitRoutes);
app.use("/api/v1/furnishing", furnishingRoutes);
app.use("/api/v1/parking", parkingRoutes);
app.use("/api/v1/petpolicy", petPolicyRoutes);
app.use("/api/v1/create-property", createPropertyRoutes);
app.use("/api/v1", uploadRoutes);
app.use("/api/v1/deposit", depositRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/owners", ownerRoutes);
app.use("/api/v1/staffs", staffRoutes);
app.use("/api/v1/currency", currencyRoutes);

/* =========================================================
   🚨 Global Error Handler
========================================================= */
app.use(errorHandler);

/* =========================================================
   ✅ Start Server (for Local Development)
========================================================= */
const PORT = process.env.PORT || 5000;

// Wait until MongoDB connects before starting server
mongoose.connection.once("open", () => {
  console.log(
    `✅ MongoDB Connected: ${mongoose.connection.host}:${mongoose.connection.port}`
      .green.bold
  );

  app.listen(PORT, () => {
    console.log(`🚀 Server running on: http://localhost:${PORT}`.cyan.bold);
  });
});

// Handle MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`.red);
});

/* =========================================================
   ✅ Export (Required for Vercel)
========================================================= */
module.exports = app;
