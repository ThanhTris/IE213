const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
if (process.env.NODE_ENV !== "test" && !process.env.JEST_WORKER_ID) {
  app.use(morgan("dev"));
}
app.use(express.json());

// Routes
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
