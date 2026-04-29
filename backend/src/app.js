const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const health = require("./controllers/health.controller");

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
if (process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
  app.use(morgan("dev"));
}
app.use(express.json());

// Routes
const repairLogRoutes = require("./routes/repairLog.routes");
const apiRoutes = require("./routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const warrantyRoutes = require("./routes/warranty.routes");
const transferRoutes = require("./routes/transfer.routes");

app.use("/api/warranties", warrantyRoutes);
app.use("/api/repair-logs", repairLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api", apiRoutes);

// Health check route
app.get("/health", health.getHealthStatus);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
