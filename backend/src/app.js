const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const health = require("./controllers/health.controller");

const app = express();

app.use(cors());
if (process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
  app.use(morgan("dev"));
}
app.use(express.json());

// Routes
const apiRoutes = require("./routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const warrantyRoutes = require("./routes/warranty.routes");
const repairLogRoutes = require("./routes/repairLog.routes");
app.use("/api", apiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warranties", warrantyRoutes);
app.use("/api/repair-logs", repairLogRoutes);

// Health check route
app.get("/health", health.getHealthStatus);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
