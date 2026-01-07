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
const projectCommunityRoutes = require("./routes/projectCommunity");
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
const blockRoutes = require("./routes/blockRoutes");
const feeTaxRoutes = require("./routes/feeTaxRoutes");
const legalDocumentRoutes = require("./routes/legalDocumentRoutes");
const floorRangeRoutes = require("./routes/floorRangeRoutes");
const propertyListingRoutes = require("./routes/propertyListingRoutes");
const propertyRoutes = require("./routes/property");
const homePageRoutes = require("./routes/homePageRoutes");
const aboutPageRoutes = require("./routes/aboutPageRoutes");
const contactPageRoutes = require("./routes/contactPageRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const blogPageRoutes = require("./routes/blogPageRoutes");
const headerRoutes = require("./routes/headerRoutes");
const footerRoutes = require("./routes/footerRoutes");
const agentRoutes = require("./routes/agentRoutes");
const roleRoutes = require("./routes/roleRoutes");
const contactEnquiryRoutes = require("./routes/contactEnquiryRoutes");

// ===== Connect to MongoDB =====
connectDB();

// ===== Initialize App =====
const app = express();

/* =========================================================
   🌐 FIX: Allow direct browser open of http://localhost:5000/
========================================================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Running 🚀",
  });
});

/* =========================================================
   📁 File Upload Middleware
========================================================= */
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: false,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (videos stored as files, not in MongoDB)
  })
);

/* =========================================================
   🌍 CORS CONFIG (403 FIX)
========================================================= */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman/no-origin + your allowed frontends
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:9002",
        "https://183-housingsolutions.vercel.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================================================
   🔐 Security Middleware
========================================================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(cookieParser());
app.use(hpp());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* =========================================================
   ⛔ Rate Limiter
========================================================= */
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
   ⚠️ Skip sanitizeInput only for LOGIN
========================================================= */
app.use((req, res, next) => {
  if (req.path === "/api/v1/auth/login") {
    return next(); // ignore sanitize on login
  }
  sanitizeInput(req, res, next);
});

/* =========================================================
   📁 Serve Static Files (Uploads)
========================================================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   🛣️ API Routes
========================================================= */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/project-community", projectCommunityRoutes);
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
app.use("/api/v1/block", blockRoutes);
app.use("/api/v1/feetax", feeTaxRoutes);
app.use("/api/v1/legaldocument", legalDocumentRoutes);
app.use("/api/v1/floorRange", floorRangeRoutes);
app.use("/api/v1/propertyListing", propertyListingRoutes);
app.use("/api/v1/home-page", homePageRoutes);
app.use("/api/v1/about-page", aboutPageRoutes);
app.use("/api/v1/contact-page", contactPageRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/blog-page", blogPageRoutes);
app.use("/api/v1/header", headerRoutes);
app.use("/api/v1/footer", footerRoutes);
app.use("/api/v1/agent", agentRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/contact-enquiry", contactEnquiryRoutes);

/* =========================================================
   ⚠️ Error Handler
========================================================= */
app.use(errorHandler);

/* =========================================================
   🚀 Start Server
========================================================= */
const PORT = process.env.PORT || 5000;

mongoose.connection.once("open", () => {
  console.log(
    `✅ MongoDB Connected: ${mongoose.connection.host}:${mongoose.connection.port}`
      .green.bold
  );

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`.cyan.bold);
  });
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB Error: ${err.message}`.red);
});

/* =========================================================
   📦 Export for Vercel
========================================================= */
module.exports = app;
