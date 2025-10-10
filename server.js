require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const colors = require("colors");
const { Server } = require("socket.io");

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

// ===== Connect to MongoDB =====
connectDB();

// ===== Initialize App =====
const app = express();
const httpServer = http.createServer(app);

// ===== Socket.IO =====
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:9002",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

/* =========================================================
   ⚙️ Middleware Order (IMPORTANT!)
========================================================= */

// ✅ 1️⃣ Handle File Uploads BEFORE body parsers
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: false, // prevents tmp path issues
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  })
);

// ✅ 2️⃣ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:9002",
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

// ✅ 3️⃣ Standard Security & Parsers
app.use(
  helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false })
);
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(cookieParser());
app.use(sanitizeInput);
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(hpp());

// ✅ 4️⃣ Rate Limiter
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min
    max: 500,
    message: {
      success: false,
      error: "Too many requests, please try again later.",
    },
  })
);

/* =========================================================
   🗂️ Static Upload Folder
========================================================= */
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

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

/* =========================================================
   🚨 Global Error Handler
========================================================= */
app.use(errorHandler);

/* =========================================================
   🚀 Server Start
========================================================= */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  );
});

// ===== Handle Unhandled Promise Rejections =====
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red);
  httpServer.close(() => process.exit(1));
});
